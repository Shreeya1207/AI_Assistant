import React, { useState, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

/**
 * PrescriptionUploadPage
 * Props:
 *   patient       — current patient context (optional, {id, name})
 *   onSuccess(medicines) — called with matched medicine array on successful OCR + parse
 *   onBack()      — called to dismiss the modal
 */
export default function PrescriptionUploadPage({ patient, onSuccess, onBack, setAgentActivity }) {
    const [imgSrc, setImgSrc] = useState(null);   // preview data-URL
    const [b64, setB64] = useState(null);   // clean base64 (no prefix)
    const [ocrText, setOcrText] = useState('');
    const [medicines, setMeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(''); // ai status message
    const [loadingPct, setLoadingPct] = useState(0);   // 0-100 for progress bar
    const [step, setStep] = useState('upload'); // 'upload' | 'ocr' | 'done'
    const [error, setError] = useState('');
    const fileRef = useRef(null);
    const abortRef = useRef(null);  // AbortController ref for timeout

    // ── Convert file to base64, strip data URI prefix ──────────────────────────
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            const clean = result.split(',')[1]; // strip "data:image/...;base64,"
            resolve(clean);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    // ── Handle file selection ─────────────────────────────────────────────────
    const handleFile = async (file) => {
        if (!file) return;
        setError('');
        setImgSrc(URL.createObjectURL(file));
        const clean = await toBase64(file);
        setB64(clean);
        setStep('upload');
    };

    // ── Run OCR via Ollama llava (fast) ──────────────────────────────────────
    const runOCR = async () => {
        if (!b64) { setError('Please upload an image first.'); return; }
        setLoading(true); setError('');
        setLoadingStep('Sending image to llava…'); setLoadingPct(15);

        // 30-second abort safety
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        const timeout = setTimeout(() => ctrl.abort(), 30000);

        try {
            setLoadingStep('llava is reading the prescription…'); setLoadingPct(35);
            const t0 = Date.now();
            if (setAgentActivity) setAgentActivity('👁️ OCR Agent — scanning handwritten prescription…');
            const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
                model: 'llava',   // faster than llava:13b
                prompt: `You are a pharmacy OCR assistant reading a handwritten or printed Indian prescription.
Common abbreviations you may see:
  T. or Tab. = Tablet, Cp. = Capsule, Syp. = Syrup, Inj. = Injection,
  BD = twice a day, TDS = three times a day, OD = once a day, SOS = as needed,
  x3 or ×3 = for 3 days, + sign beside a dose = standard dosage.

Please output:
1. Patient name (if visible)
2. Diagnosis (if visible)
3. Each medicine — one per line in format:
   <medicine name as written> <dosage> <frequency> <duration>

Only output what is clearly written. Use [unclear] for illegible parts.
Do NOT add explanations or extra text.`,
                images: [b64],
                stream: false,
            }, { signal: ctrl.signal });

            clearTimeout(timeout);
            setLoadingPct(80);
            const text = ollamaRes.data.response?.trim() || '';
            setOcrText(text);
            setLoadingStep('Text extracted — review and proceed…'); setLoadingPct(100);
            setStep('ocr');  // show extracted text for review, NOT done yet
            setLoadingStep(''); setLoadingPct(0);
            if (setAgentActivity) {
                const elapsed = Date.now() - t0;
                await new Promise(r => setTimeout(r, Math.max(0, 3000 - elapsed)));
                setAgentActivity('');
            }
        } catch (err) {
            clearTimeout(timeout);
            setLoadingStep(''); setLoadingPct(0);
            if (setAgentActivity) setAgentActivity('');
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                setError('OCR timed out. Make sure Ollama is running: ollama serve');
            } else if (err.code === 'ERR_NETWORK' || err.message.includes('11434')) {
                setError('Cannot reach Ollama. Make sure it is running: ollama serve');
            } else {
                setError(err.response?.data?.error || err.message);
            }
        }
        setLoading(false);
    };

    // ── Proceed: save OCR text to DB + match medicines ───────────────────────
    const [proceeding, setProceeding] = useState(false);
    const handleProceed = async () => {
        if (!ocrText.trim()) return;
        setProceeding(true);
        const t1 = Date.now();
        if (setAgentActivity) setAgentActivity('🧠 Intent Matcher — linking prescription to inventory…');
        // Save edited OCR text to patient record
        if (patient?.id) {
            try {
                await axios.post(`${API}/customers/${patient.id}/prescription`, { ocrText: ocrText.trim() });
            } catch (_) { /* non-blocking */ }
        }
        // Match medicines from DB
        try {
            const allMeds = (await axios.get(`${API}/medicines`)).data;
            const matched = matchMedicines(ocrText, allMeds);
            setMeds(matched);
            setStep('done');
        } catch (_) { setStep('done'); }
        if (setAgentActivity) {
            const elapsed = Date.now() - t1;
            await new Promise(r => setTimeout(r, Math.max(0, 3000 - elapsed)));
            setAgentActivity('');
        }
        setProceeding(false);
    };

    // ── Simple medicine matcher (same logic as App.jsx medicineMeds) ──────────
    const matchMedicines = (text, allMeds) => {
        const tl = text.toLowerCase();
        const seen = new Set();
        const res = [];
        allMeds.forEach(m => {
            const base = m.name.toLowerCase().split(' ')[0];
            const gen = m.generic_name?.toLowerCase().split(' ')[0];
            if ((base.length >= 4 && tl.includes(base)) || (gen && gen.length >= 4 && tl.includes(gen))) {
                if (!seen.has(m.id)) { seen.add(m.id); res.push({ ...m, qty: 1, selected: true }); }
            }
        });
        return res;
    };

    // ── Confirm — hand medicines back to parent ───────────────────────────────
    const handleConfirm = () => {
        if (!medicines.length) { setError('No medicines matched. Please type them manually.'); return; }
        onSuccess(medicines);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onBack}
                style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,37,.45)', zIndex: 300, backdropFilter: 'blur(4px)' }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 580, maxHeight: '90vh', overflowY: 'auto',
                background: '#fff', borderRadius: 18, zIndex: 301,
                boxShadow: '0 24px 80px rgba(26,46,37,.22)',
                fontFamily: "'Segoe UI',sans-serif",
                animation: 'rxFadeIn .22s ease',
            }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#1c4232,#2a6049)', padding: '20px 24px', borderRadius: '18px 18px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>📋 Prescription Upload OCR</div>
                        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginTop: 3 }}>
                            {patient ? `Patient: ${patient.name}` : 'Walk-in patient'} · Powered by llava
                        </div>
                    </div>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ padding: 24 }}>

                    {/* Step 1: Upload */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, color: '#7a9688', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
                            Step 1 — Upload Prescription Image
                        </div>
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                            style={{
                                border: `2px dashed ${imgSrc ? '#2a6049' : '#c8ddd1'}`,
                                borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer',
                                background: imgSrc ? '#f0f8f4' : '#f8fcfa', transition: 'all .2s',
                            }}
                        >
                            {imgSrc ? (
                                <img src={imgSrc} alt="Prescription preview" style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, objectFit: 'contain' }} />
                            ) : (
                                <>
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>🖼</div>
                                    <div style={{ fontWeight: 600, color: '#2a6049' }}>Click or drag & drop prescription</div>
                                    <div style={{ fontSize: 12, color: '#7a9688', marginTop: 4 }}>JPG, PNG, or WEBP — best results with clear, well-lit photos</div>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                        {imgSrc && (
                            <button onClick={() => fileRef.current?.click()} style={{ marginTop: 8, fontSize: 12, color: '#7a9688', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                Change image
                            </button>
                        )}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        {loading ? (
                            // ── Linear Progress Bar ──
                            <div style={{ background: '#f0f8f4', border: '1px solid #c8ddd1', borderRadius: 14, padding: '20px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ fontWeight: 700, color: '#1a2e25', fontSize: 13 }}>🤖 AI is working…</span>
                                    <span style={{ fontSize: 12, color: '#2a6049', fontWeight: 600 }}>{loadingPct}%</span>
                                </div>
                                {/* Track */}
                                <div style={{ height: 8, background: '#d4e8dc', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', borderRadius: 99,
                                        background: 'linear-gradient(90deg,#2a6049,#6ee7b7)',
                                        width: `${loadingPct}%`,
                                        transition: 'width 0.6s ease'
                                    }} />
                                </div>
                                {/* Steps row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                                    {[
                                        { label: 'Sending', pct: 15 },
                                        { label: 'Reading', pct: 35 },
                                        { label: 'Extracting', pct: 80 },
                                        { label: 'Done', pct: 100 },
                                    ].map(s => (
                                        <span key={s.label} style={{
                                            fontSize: 10, fontWeight: 600,
                                            color: loadingPct >= s.pct ? '#2a6049' : '#b0c9bb'
                                        }}>{s.label}</span>
                                    ))}
                                </div>
                                <div style={{ marginTop: 8, fontSize: 11, color: '#7a9688' }}>{loadingStep}</div>
                            </div>
                        ) : (
                            <button
                                onClick={runOCR}
                                disabled={!b64}
                                style={{
                                    background: b64 ? 'linear-gradient(135deg,#2a6049,#1c4232)' : '#c8ddd1',
                                    color: '#fff', border: 'none', borderRadius: 10,
                                    padding: '12px 32px', fontWeight: 700, fontSize: 15,
                                    cursor: b64 ? 'pointer' : 'not-allowed',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                }}
                            >
                                🔍 Extract Medicines from Image
                            </button>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#fdf0f0', border: '1px solid #f5c4c4', borderRadius: 8, padding: '10px 14px', color: '#e05c5c', fontSize: 13, marginBottom: 16 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* OCR result text — shown after extraction, before Proceed */}
                    {ocrText && (step === 'ocr' || step === 'done') && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, color: '#2a6049', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                📄 Extracted Text <span style={{ color: '#7a9688', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(editable — fix any OCR errors)</span>
                            </div>
                            <textarea
                                value={ocrText}
                                onChange={e => setOcrText(e.target.value)}
                                rows={7}
                                style={{
                                    width: '100%', border: '1px solid #c8ddd1', borderRadius: 10,
                                    padding: '12px 14px', fontSize: 13, fontFamily: 'monospace',
                                    outline: 'none', resize: 'vertical', color: '#1a2e25',
                                    boxSizing: 'border-box',
                                    background: '#fafcfb',  // light, readable background
                                    lineHeight: 1.7
                                }}
                            />
                            {/* Proceed button — only show before done step */}
                            {step === 'ocr' && (
                                <button
                                    onClick={handleProceed}
                                    disabled={proceeding || !ocrText.trim()}
                                    style={{
                                        marginTop: 10, width: '100%',
                                        background: 'linear-gradient(135deg,#2a6049,#1c4232)',
                                        color: '#fff', border: 'none', borderRadius: 10,
                                        padding: '12px 20px', fontWeight: 700, fontSize: 15,
                                        cursor: proceeding ? 'not-allowed' : 'pointer',
                                        opacity: proceeding ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                >
                                    {proceeding ? '⏳ Matching medicines…' : '→ Proceed & Match Medicines'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Matched Medicines Table */}
                    {step === 'done' && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 11, color: '#7a9688', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                                Step 3 — Matched Medicines ({medicines.length} found)
                            </div>

                            {medicines.length === 0 ? (
                                <div style={{ background: '#fdf4e7', border: '1px solid #f0d9b5', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#c97c2a' }}>
                                    ⚠️ No medicines matched in inventory. You can type the prescription manually in the chat.
                                </div>
                            ) : (
                                <div style={{ border: '1px solid #e4ece7', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr', background: '#1a2e25', padding: '8px 14px', gap: 8 }}>
                                        {['Medicine', 'Dosage', 'Stock', 'Price'].map(h => (
                                            <div key={h} style={{ color: '#7a9688', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
                                        ))}
                                    </div>
                                    {medicines.map((m, i) => (
                                        <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr', padding: '10px 14px', gap: 8, background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f0f5f2', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                                                {m.generic_name && <div style={{ fontSize: 10, color: '#7a9688' }}>{m.generic_name}</div>}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#7a9688' }}>{m.dosage || '—'}</div>
                                            <div style={{ fontSize: 12, color: m.stock > 0 ? '#2a6049' : '#e05c5c', fontWeight: 600 }}>
                                                {m.stock > 0 ? `✓ ${m.stock}` : '✕ Out'}
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#2a6049' }}>₹{parseFloat(m.price || 0).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={onBack} style={{ background: '#f5f7f5', color: '#1a2e25', border: '1px solid #e4ece7', borderRadius: 10, padding: '10px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                            Cancel
                        </button>
                        {step === 'done' && medicines.length > 0 && (
                            <button
                                onClick={handleConfirm}
                                style={{ background: 'linear-gradient(135deg,#2a6049,#1c4232)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                            >
                                ✓ Use These Medicines
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes rxFadeIn { from { opacity: 0; transform: translate(-50%,-52%); } to { opacity: 1; transform: translate(-50%,-50%); } }
        @keyframes rxSpin   { to { transform: rotate(360deg); } }
      `}</style>
        </>
    );
}
