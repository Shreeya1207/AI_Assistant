const express = require('express');
const cors = require('cors');
const { db, firebase } = require('./firebase');
const { extractPrescription, checkOllamaHealth } = require('./ollama');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Helper: Firestore doc → plain object with id ──────────────────────────────
function docToObj(doc) {
    return { id: doc.id, ...doc.data() };
}

// ─── Helper: Fetch entire collection as array ──────────────────────────────────
async function getAll(collectionName) {
    const snap = await db.collection(collectionName).get();
    return snap.docs.map(docToObj);
}

// ─── Helper: Fuzzy customer match (same logic as before) ──────────────────────
function findCustomer(name, allCustomers) {
    if (!name) return null;
    const nameLower = name.toLowerCase().trim();

    // 1. Exact match
    let match = allCustomers.find(c => c.name.toLowerCase() === nameLower);
    if (match) return match;

    // 2. All words must appear (bi-directional substring)
    match = allCustomers.find(c => {
        const cParts = c.name.toLowerCase().split(' ');
        const nParts = nameLower.split(' ');
        return nParts.every(part => cParts.some(cp => cp.includes(part) || part.includes(cp)));
    });
    if (match) return match;

    // 3. Prefix match on first name
    const firstName = nameLower.split(' ')[0];
    return allCustomers.find(c => c.name.toLowerCase().startsWith(firstName)) || null;
}

// ─── Helper: Fuzzy medicine match ─────────────────────────────────────────────
function findMedicine(name, allMedicines) {
    if (!name) return null;
    const nameLower = name.toLowerCase().trim();

    let match = allMedicines.find(m => m.name.toLowerCase() === nameLower);
    if (match) return match;

    match = allMedicines.find(m => m.name.toLowerCase().includes(nameLower));
    if (match) return match;

    match = allMedicines.find(m => nameLower.includes(m.name.toLowerCase()));
    if (match) return match;

    const firstWord = nameLower.split(' ')[0];
    return allMedicines.find(m =>
        m.name.toLowerCase().startsWith(firstWord) ||
        (m.generic_name && m.generic_name.toLowerCase().startsWith(firstWord))
    ) || null;
}

// ─── ROUTE: Health check ───────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    const ollamaHealth = await checkOllamaHealth();
    res.json({
        server: 'ok',
        ollama: ollamaHealth,
        database: 'firestore',
        timestamp: new Date().toISOString()
    });
});

// ─── ROUTE: Extract prescription (Ollama) ─────────────────────────────────────
app.post('/api/extract-prescription', async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length < 5) {
        return res.status(400).json({ success: false, error: 'Input text is too short' });
    }
    try {
        const extracted = await extractPrescription(text);
        console.log('📋 Extracted:', JSON.stringify(extracted, null, 2));

        const [allCustomers, allMeds] = await Promise.all([getAll('customers'), getAll('medicines')]);

        const customer = findCustomer(extracted.patient_name, allCustomers);
        if (customer) {
            const today = new Date().toISOString().split('T')[0];
            await db.collection('customers').doc(customer.id).update({ last_visit: today });
            customer.last_visit = today;
        }

        const medicinesList = (extracted.medicines || []).map(med => {
            const medicine = findMedicine(med.medicine_name, allMeds);
            const quantity = med.quantity || (med.frequency_per_day * med.days) || 0;
            const stockStatus = medicine ? {
                available: medicine.stock, required: quantity,
                shortage: Math.max(0, quantity - medicine.stock),
                sufficient: medicine.stock >= quantity
            } : null;
            return {
                ...med, quantity, medicine, stock_status: stockStatus,
                unit_price: medicine ? medicine.price : null,
                total_price: medicine ? (medicine.price * quantity).toFixed(2) : null,
            };
        });

        const now = new Date();
        const grandTotal = medicinesList.reduce((s, m) => s + (parseFloat(m.total_price) || 0), 0).toFixed(2);

        res.json({
            success: true,
            data: {
                patient_name: extracted.patient_name,
                medicines: medicinesList,
                customer,
                order_date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                order_time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                grand_total: grandTotal
            }
        });
    } catch (err) {
        console.error('❌ Extraction error:', err.message);
        if (err.message.includes('fetch') || err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ success: false, error: 'Ollama is not running. Please start it with: ollama serve' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Search customer by name (fuzzy) — used by AI Assistant ────────────
app.get('/api/customers/search', async (req, res) => {
    const { name } = req.query;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name query param required' });
    try {
        const all = await getAll('customers');
        const customer = findCustomer(name.trim(), all);
        // Update last_visit immediately on lookup so every interaction is tracked
        if (customer) {
            const today = new Date().toISOString().split('T')[0];
            await db.collection('customers').doc(customer.id).update({ last_visit: today });
            customer.last_visit = today;
            console.log(`👤 Patient visit recorded: ${customer.name} → ${today}`);
        }
        res.json({ found: !!customer, customer: customer || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ROUTE: Get all customers ──────────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
    try {
        const all = await getAll('customers');
        all.sort((a, b) => a.name.localeCompare(b.name));
        const search = (req.query.search || '').toLowerCase();
        res.json(search ? all.filter(c => c.name.toLowerCase().includes(search)) : all);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ROUTE: Create new customer ───────────────────────────────────────────────
app.post('/api/customers', async (req, res) => {
    const { name, phone, allergies, email, age, gender, last_visit } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Name is required' });
    }
    try {
        const customerData = {
            name: name.trim(),
            phone: (phone || '').trim(),
            allergies: allergies || 'None',
            email: email || '',
            age: age || '',
            gender: gender || '',
            last_visit: last_visit || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };
        const ref = await db.collection('customers').add(customerData);
        const customer = { id: ref.id, ...customerData };
        console.log(`✅ New patient registered: ${name} → ${ref.id}`);
        res.json({ success: true, customer });
    } catch (err) {
        console.error('❌ Customer error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Get single customer + order history ────────────────────────────────
app.get('/api/customers/:id', async (req, res) => {
    try {
        const docSnap = await db.collection('customers').doc(req.params.id).get();
        if (!docSnap.exists) return res.status(404).json({ error: 'Customer not found' });

        const allOrders = await getAll('orders');
        const history = allOrders
            .filter(o => o.customer_id === req.params.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        res.json({ ...docToObj(docSnap), purchase_history: history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ROUTE: Save OCR prescription text to customer record ─────────────────────
app.post('/api/customers/:id/prescription', async (req, res) => {
    const { ocrText } = req.body;
    if (!ocrText || !ocrText.trim()) {
        return res.status(400).json({ success: false, error: 'ocrText is required' });
    }
    try {
        await db.collection('customers').doc(req.params.id).update({
            prescriptions: firebase.firestore.FieldValue.arrayUnion({
                text: ocrText.trim(),
                scanned_at: new Date().toISOString(),
            }),
        });
        console.log(`📋 OCR prescription saved → customer ${req.params.id}`);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Prescription save error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Create order ───────────────────────────────────────────────────────
app.post('/api/create-order', async (req, res) => {
    const { customer_id, customer_name, medicine_id, medicine_name, dosage, quantity, price_per_unit, notes } = req.body;
    if (!customer_name || !medicine_name || !quantity || !price_per_unit) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    try {
        const now = new Date();
        const total_price = (price_per_unit * quantity).toFixed(2);
        const order_date = now.toISOString().split('T')[0];
        const order_time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const orderRef = await db.collection('orders').add({
            customer_id: customer_id || null,
            customer_name,
            medicine_id: medicine_id || null,
            medicine_name,
            dosage: dosage || '',
            quantity,
            price_per_unit,
            total_price,
            order_date,
            order_time,
            status: 'completed',
            notes: notes || '',
            created_at: now.toISOString()
        });

        // Decrement stock atomically
        if (medicine_id) {
            await db.collection('medicines').doc(medicine_id).update({
                stock: firebase.firestore.FieldValue.increment(-Number(quantity))
            });
        }

        // Update patient last_visit
        if (customer_id) {
            await db.collection('customers').doc(customer_id).update({ last_visit: order_date });
        }

        const updatedMed = medicine_id
            ? docToObj(await db.collection('medicines').doc(medicine_id).get())
            : null;

        console.log(`✅ Order ${orderRef.id}: ${customer_name} — ${medicine_name} x${quantity}`);
        res.json({
            success: true,
            order_id: orderRef.id,
            total_price,
            order_date,
            order_time,
            updated_stock: updatedMed?.stock ?? null
        });
    } catch (err) {
        console.error('❌ Order error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ─── ROUTE: Get all medicines ──────────────────────────────────────────────────
app.get('/api/medicines', async (req, res) => {
    try {
        const all = await getAll('medicines');
        all.sort((a, b) => a.name.localeCompare(b.name));
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ROUTE: Get medicine alternatives ─────────────────────────────────────────
app.get('/api/alternatives/:medicineName', async (req, res) => {
    try {
        const all = await getAll('medicines');
        const term = req.params.medicineName.split(' ')[0].toLowerCase();
        const excludeId = req.query.exclude;
        const alternatives = all.filter(m =>
            m.id !== excludeId && m.stock > 0 &&
            (m.name.toLowerCase().includes(term) || (m.generic_name && m.generic_name.toLowerCase().includes(term)))
        );
        res.json(alternatives);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ROUTE: Get purchase history ──────────────────────────────────────────────
app.get('/api/purchase-history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const all = await getAll('orders');
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(all.slice(0, limit));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ROUTE: Dashboard stats ────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
    try {
        const [customers, medicines, orders] = await Promise.all([
            getAll('customers'), getAll('medicines'), getAll('orders')
        ]);
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = orders
            .filter(o => o.order_date === today)
            .reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
        const lowStock = medicines.filter(m => m.stock < m.min_stock).length;

        res.json({
            total_orders: orders.length,
            total_customers: customers.length,
            total_medicines: medicines.length,
            low_stock_count: lowStock,
            today_revenue: todayRevenue.toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 HackfusionRX Backend → http://localhost:${PORT}`);
    console.log(`🔥 Database: Firebase Firestore (agentic-ai-d0b7e)`);
    console.log(`🤖 Ollama model: ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
    console.log(`\nRoutes:`);
    console.log(`  GET  /api/health`);
    console.log(`  GET  /api/customers/search?name=`);
    console.log(`  GET  /api/customers`);
    console.log(`  POST /api/customers`);
    console.log(`  POST /api/create-order`);
    console.log(`  GET  /api/medicines`);
    console.log(`  GET  /api/purchase-history`);
    console.log(`  GET  /api/stats\n`);
});