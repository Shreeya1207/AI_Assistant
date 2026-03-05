import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import PrescriptionUploadPage from './PrescriptionUploadPage';

const API = 'http://localhost:3001/api';

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  MicOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  Send: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  Alert: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Dashboard: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  Inventory: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
  Customers: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Reports: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  Bot: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  Logout: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Pill: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
  AI: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" /></svg>,
  UserPlus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  ArrowRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>,
};

// ─── Symptom → Medicine Map ─────────────────────────────────────────────────────
const SYMPTOM_MAP = {
  cold: ['Cetirizine 10mg', 'Paracetamol 500mg', 'Amoxicillin 500mg', 'Ibuprofen 200mg'],
  cough: ['Amoxicillin 250mg', 'Azithromycin 500mg', 'Cetirizine 10mg', 'Paracetamol 500mg'],
  fever: ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Paracetamol 1000mg', 'Ibuprofen 200mg'],
  'loose motion': ['Ciprofloxacin 500mg', 'Omeprazole 20mg', 'Paracetamol 500mg', 'Cetirizine 10mg'],
  headache: ['Ibuprofen 400mg', 'Paracetamol 500mg', 'Ibuprofen 200mg', 'Paracetamol 1000mg'],
  'body pain': ['Ibuprofen 400mg', 'Paracetamol 500mg', 'Ibuprofen 200mg', 'Paracetamol 1000mg'],
  vomiting: ['Omeprazole 20mg', 'Ciprofloxacin 500mg', 'Paracetamol 500mg', 'Cetirizine 10mg'],
  acidity: ['Omeprazole 20mg', 'Paracetamol 500mg', 'Cetirizine 10mg', 'Ibuprofen 200mg'],
  allergy: ['Cetirizine 10mg', 'Ibuprofen 200mg', 'Paracetamol 500mg', 'Amoxicillin 500mg'],
  'sore throat': ['Azithromycin 500mg', 'Amoxicillin 500mg', 'Ibuprofen 400mg', 'Paracetamol 500mg'],
};
const SYMPTOM_KEYS = Object.keys(SYMPTOM_MAP);
const detectType = t => SYMPTOM_KEYS.some(k => t.toLowerCase().includes(k)) ? 'symptom' : 'medicine';
const symptomMeds = (t, all) => { const n = new Set(); SYMPTOM_KEYS.filter(k => t.toLowerCase().includes(k)).forEach(k => SYMPTOM_MAP[k].forEach(x => n.add(x))); return [...n].map(nm => all.find(m => m.name === nm)).filter(Boolean); };
const medicineMeds = (t, all) => {
  const seen = new Set(); const res = []; const tl = t.toLowerCase();
  // Pass 1: scan full text for every medicine/generic base name directly (handles no-comma voice input)
  all.forEach(x => {
    const base = x.name.toLowerCase().split(' ')[0];         // e.g. "amoxicillin" from "amoxicillin 250mg"
    const gen = x.generic_name?.toLowerCase().split(' ')[0]; // e.g. "amoxicillin" from generic name
    if ((base.length >= 4 && tl.includes(base)) || (gen && gen.length >= 4 && tl.includes(gen))) {
      if (!seen.has(x.id)) { seen.add(x.id); res.push(x); }
    }
  });
  if (res.length) return res;
  // Pass 2: fallback — split on comma/newline and match each part
  t.split(/[,\n]+/).map(p => p.trim()).filter(Boolean).forEach(p => {
    const l = p.toLowerCase();
    const m = all.find(x => x.name.toLowerCase().includes(l) || l.includes(x.name.toLowerCase().split(' ')[0]) || (x.generic_name && x.generic_name.toLowerCase().includes(l)));
    if (m && !seen.has(m.id)) { seen.add(m.id); res.push(m); }
  });
  return res;
};

// ─── Prescription Parser ─────────────────────────────────────────────────────────
// Parses voice/text like "amoxicillin 200mg twice a day for 3 days Paracetamol 100mg once a day 2 days"
// Returns [{...medicineFromDB, qty: calculatedTotal, parsedDosageMg, frequency, duration}]
const parsePrescription = (text, allMeds) => {
  const tl = text.toLowerCase();

  // Extract frequency (doses per day) from a segment
  const getFreq = (s) => {
    if (/thrice|three\s+times/i.test(s) || /\btds\b/i.test(s)) return 3;
    if (/twice|two\s+times|\b2\s+times|\bbd\b/i.test(s)) return 2;
    if (/four\s+times|\b4\s+times|\bqid\b/i.test(s)) return 4;
    const m = s.match(/(\d+)\s*times?\s*(?:a|per)?\s*day/i);
    return m ? parseInt(m[1]) : 1;
  };

  // Extract duration in days
  const getDays = (s) => {
    const m = s.match(/for\s+(\d+)\s*days?/i) || s.match(/(\d+)\s*days?/i);
    return m ? parseInt(m[1]) : 1;
  };

  // Extract dosage in mg as a number
  const getDosageMg = (s) => {
    const m = s.match(/(\d+\.?\d*)\s*mg/i);
    return m ? parseFloat(m[1]) : null;
  };

  // Find all medicine base names present in the text, with their start index
  const hits = [];
  const seenBase = new Set();
  allMeds.forEach(med => {
    const base = med.name.toLowerCase().split(' ')[0];
    const gen = med.generic_name?.toLowerCase().split(' ')[0];
    ['base', 'gen'].forEach(key => {
      const term = key === 'base' ? base : gen;
      if (!term || term.length < 4 || seenBase.has(term)) return;
      const idx = tl.indexOf(term);
      if (idx !== -1) { seenBase.add(term); hits.push({ term, idx }); }
    });
  });

  hits.sort((a, b) => a.idx - b.idx);
  if (!hits.length) return [];

  const result = [];
  hits.forEach(({ term, idx }, i) => {
    const nextIdx = i < hits.length - 1 ? hits[i + 1].idx : text.length;
    const segment = text.slice(idx, nextIdx);

    const freq = getFreq(segment);
    const days = getDays(segment);
    const parsedDosageMg = getDosageMg(segment);

    // Find all DB medicines matching this base name
    const candidates = allMeds.filter(m => {
      const mBase = m.name.toLowerCase().split(' ')[0];
      const mGen = m.generic_name?.toLowerCase().split(' ')[0];
      return mBase === term || mGen === term;
    });
    if (!candidates.length) return;

    // Pick best dosage match from candidates
    let best = candidates[0];
    if (parsedDosageMg && candidates.length > 1) {
      best = candidates.reduce((b, m) => {
        const dB = parseFloat(b.dosage?.match(/[\d.]+/)?.[0] ?? 0);
        const dM = parseFloat(m.dosage?.match(/[\d.]+/)?.[0] ?? 0);
        return Math.abs(dM - parsedDosageMg) < Math.abs(dB - parsedDosageMg) ? m : b;
      });
    }

    const pd = segment.match(/(\d+)\s*(pill|tablet|cap(?:sule)?|drop|ml|teaspoon|sachet)s?/i);
    const perDose = pd ? parseInt(pd[1]) : 1;
    const doseUnit = pd ? pd[2].toLowerCase() : 'pill';
    const totalQtyFinal = Math.max(1, perDose * freq * days);
    result.push({
      ...best, qty: totalQtyFinal, perDose, doseUnit,
      frequency: freq, duration: days, parsedDosageMg,
      dosageLabel: perDose + ' ' + doseUnit,
      freqLabel: freq + 'x day',
      daysLabel: days + 'd',
    });
  });
  return result;
};


// ─── Countdown Bar ──────────────────────────────────────────────────────────────
function CountdownBar({ seconds, total, label, color = '#2a6049' }) {
  const pct = (seconds / total) * 100;
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7a9688', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{seconds}s</span>
      </div>
      <div style={{ height: 4, background: '#e4ece7', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

// ─── Voice Input Hook ───────────────────────────────────────────────────────────
function useVoiceInput(onResult) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const silenceRef = useRef(null);

  const start = (fieldHint = '') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge for voice input.'); return; }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e) => {
      const text = Array.from(e.results).map(x => x[0].transcript.trim()).join(' ').trim();
      onResult(text, fieldHint);
      if (silenceRef.current) clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => stop(), 2000);
    };
    r.onerror = () => stop();
    r.onend = () => setRecording(false);
    r.start();
    recognitionRef.current = r;
    setRecording(true);
  };

  const stop = () => {
    if (silenceRef.current) clearTimeout(silenceRef.current);
    recognitionRef.current?.stop();
    setRecording(false);
  };

  return { recording, start, stop };
}

// ─── New Patient Registration Page ─────────────────────────────────────────────
function NewPatientPage({ detectedName, onPatientCreated, onSkip }) {
  const [form, setForm] = useState({ name: detectedName || '', age: '', gender: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPatient, setSavedPatient] = useState(null);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [autoSubmitCd, setAutoSubmitCd] = useState(null);
  const timerRef = useRef(null);
  const autoRef = useRef(null);
  const cdRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceRef = useRef(null);
  const voiceTextRef = useRef('');   // always holds latest transcript for final parse
  // Use a ref so handleSubmit inside setTimeout sees latest form
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);
  // parseVoice ref so r.onend closure calls the latest version
  const parseVoiceRef = useRef(null);

  // Redirect countdown after saved
  useEffect(() => { if (saved) setCountdown(3); }, [saved]);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { onPatientCreated(savedPatient); return; }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const allFilled = !!(form.name && form.age && form.gender && form.phone && form.email && form.email.includes('@'));

  // Refs so the timeout callback can check latest saving/saved without being in deps
  const savingRef = useRef(false);
  const savedRef = useRef(false);
  useEffect(() => { savingRef.current = saving; }, [saving]);
  useEffect(() => { savedRef.current = saved; }, [saved]);

  // Auto-submit countdown when all 4 fields filled
  // Only depends on allFilled — NOT on saving/saved (to avoid timer cancellation on state change)
  useEffect(() => {
    clearTimeout(autoRef.current); clearInterval(cdRef.current); setAutoSubmitCd(null);
    if (!allFilled) return;
    stopRecording(); // stop mic once all fields are ready — no need for more voice input
    setAutoSubmitCd(3);
    let cd = 3;
    cdRef.current = setInterval(() => {
      cd--;
      setAutoSubmitCd(cd);
      if (cd <= 0) clearInterval(cdRef.current);
    }, 1000);
    autoRef.current = setTimeout(() => {
      if (!savingRef.current && !savedRef.current) doSubmit(formRef.current);
    }, 3000);
    return () => { clearTimeout(autoRef.current); clearInterval(cdRef.current); };
  }, [allFilled]); // eslint-disable-line react-hooks/exhaustive-deps

  const parseVoice = (text) => {
    const t = text.toLowerCase();
    const ageMatch = t.match(/age\s+(\d+)|(\d{1,3})\s+years?/) || t.match(/\b(\d{1,3})\b/);
    if (ageMatch) {
      const a = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
      if (a && a < 120) setForm(f => ({ ...f, age: String(a) }));
    }
    if (t.includes('female') || t.includes('woman') || t.includes('girl')) setForm(f => ({ ...f, gender: 'Female' }));
    else if (t.includes('male') || t.includes('man') || t.includes('boy')) setForm(f => ({ ...f, gender: 'Male' }));
    const ph = text.match(/(?:phone|number|contact|mobile)[\s:]+([0-9\s\-]{7,15})/i) || text.match(/\b([0-9]{10,15})\b/);
    if (ph) setForm(f => ({ ...f, phone: ph[1].replace(/\s/g, '') }));
    // Email extraction — anchor to the word "email" in the transcript
    const emailKeyIdx = t.indexOf('email');
    if (emailKeyIdx !== -1) {
      let afterEmail = text.slice(emailKeyIdx + 5).trim();
      // Skip optional filler words: "email address ..." or "email id ..."
      afterEmail = afterEmail.replace(/^(?:address|id|:)\s*/i, '');
      // Try typed format (has @ already): "gaurik@gmail.com"
      const typedM = afterEmail.match(/([a-zA-Z0-9][a-zA-Z0-9._%+\-]*@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
      if (typedM) {
        setForm(f => ({ ...f, email: typedM[1] }));
      } else {
        // Spoken format — find " at " separator
        const atIdx = afterEmail.toLowerCase().indexOf(' at ');
        if (atIdx !== -1) {
          // Everything before " at " = username  (multi-word → join with dot)
          const username = afterEmail.slice(0, atIdx).trim().replace(/\s+/g, '.').toLowerCase();
          // Everything after " at " = domain  (handle "dot" spoken)
          const domain = afterEmail.slice(atIdx + 4).trim()
            .replace(/\s+dot\s+/gi, '.').replace(/\s+/g, '').toLowerCase();
          if (username && domain.includes('.')) {
            setForm(f => ({ ...f, email: `${username}@${domain}` }));
          }
        }
      }
    } else {
      // No "email" keyword — scan whole text for a literal typed email
      const anyM = text.match(/([a-zA-Z0-9][a-zA-Z0-9._%+\-]*@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
      if (anyM) setForm(f => ({ ...f, email: anyM[1] }));
    }
  };
  // Keep parseVoiceRef in sync
  parseVoiceRef.current = parseVoice;

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome/Edge for voice input.'); return; }
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      const text = Array.from(e.results).map(x => x[0].transcript.trim()).join(' ').trim();
      voiceTextRef.current = text; // keep ref in sync
      setVoiceText(text); parseVoice(text);
      if (silenceRef.current) clearTimeout(silenceRef.current);
      silenceRef.current = setTimeout(() => stopRecording(), 4000); // 4s silence = more time for email
    };
    r.onerror = () => stopRecording();
    r.onend = () => {
      setRecording(false);
      // Final parse when recording ends — catches email that arrived in the last segment
      if (voiceTextRef.current) parseVoiceRef.current?.(voiceTextRef.current);
    };
    r.start(); recognitionRef.current = r; setRecording(true);
  };
  const stopRecording = () => { if (silenceRef.current) clearTimeout(silenceRef.current); recognitionRef.current?.stop(); setRecording(false); };

  useEffect(() => {
    const t = setTimeout(() => startRecording(), 600);
    return () => { clearTimeout(t); recognitionRef.current?.stop(); };
  }, []);

  const doSubmit = async (f) => {
    if (!f.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await axios.post(`${API}/customers`, {
        name: f.name.trim(), phone: f.phone || '', allergies: 'None', email: f.email || '',
        age: f.age || '', gender: f.gender || '', last_visit: new Date().toISOString().split('T')[0]
      });
      const patient = res.data.customer || { id: res.data.customer_id, name: f.name.trim(), ...f };
      setSavedPatient(patient); setSaved(true);
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    setSaving(false);
  };
  const handleSubmit = () => doSubmit(formRef.current);

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #e4ece7', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1a2e25', background: '#fff', boxSizing: 'border-box' };
  const lbl = { fontSize: 11, fontWeight: 700, color: '#7a9688', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 };

  if (saved) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f5f2' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eaf2ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#2a6049', fontSize: 36 }}>✓</div>
        <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#2a6049' }}>Registered!</h3>
        <p style={{ margin: '0 0 4px', color: '#1a2e25', fontSize: 15 }}><strong>{form.name}</strong> added to database.</p>
        <p style={{ margin: '0 0 20px', color: '#7a9688', fontSize: 13 }}>Going to assistant in <strong>{countdown}s</strong>…</p>
        <div style={{ height: 4, background: '#e4ece7', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(countdown / 3) * 100}%`, background: '#2a6049', transition: 'width 1s linear', borderRadius: 2 }} />
        </div>
        <button onClick={() => onPatientCreated(savedPatient)} style={{ background: '#2a6049', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Go Now →</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f5f2', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: '#eaf2ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a6049' }}><Icon.UserPlus /></div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>New Patient</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#7a9688' }}>Not found · Register to continue</p>
          </div>
        </div>

        {/* Detected name pill */}
        {detectedName && (
          <div style={{ background: '#eaf2ed', border: '1px solid #c8ddd1', borderRadius: 8, padding: '7px 12px', marginBottom: 16, fontSize: 13, color: '#1c4232', display: 'flex', alignItems: 'center', gap: 6 }}>
            🔍 Detected: <strong>{detectedName}</strong>
          </div>
        )}

        {/* Voice box */}
        <div style={{ background: recording ? '#fdf0f0' : '#f5f7f5', border: `1.5px solid ${recording ? '#fca5a5' : '#e4ece7'}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={recording ? stopRecording : startRecording}
              style={{ width: 42, height: 42, borderRadius: '50%', background: recording ? '#e05c5c' : '#2a6049', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              {recording ? <Icon.MicOff /> : <Icon.Mic />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: recording ? '#e05c5c' : '#1a2e25' }}>{recording ? '🎤 Listening…' : '🎤 Voice Input'}</div>
              <div style={{ fontSize: 11, color: '#7a9688', marginTop: 1 }}>{recording ? 'Say age, gender and phone number' : 'Tap mic · Auto-fills the form below'}</div>
            </div>
          </div>
          {voiceText && <div style={{ marginTop: 10, fontSize: 12, color: '#7a9688', fontStyle: 'italic', background: '#fff', borderRadius: 6, padding: '6px 10px', border: '1px solid #e4ece7' }}>"{voiceText}"</div>}
          {recording && <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#e05c5c' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e05c5c' }} /> Auto-stops after 2s silence</div>}
        </div>

        {/* Auto-submit alert */}
        {allFilled && autoSubmitCd !== null && !saving && (
          <div style={{ background: '#eaf2ed', border: '1px solid #c8ddd1', borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 13, color: '#2a6049', fontWeight: 600 }}>
            ✅ All 5 fields complete · Auto-registering in {autoSubmitCd}s…
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Full Name *</label>
            <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarah Collins" />
          </div>
          <div>
            <label style={lbl}>Age</label>
            <input style={inp} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="e.g. 32" />
          </div>
          <div>
            <label style={lbl}>Gender</label>
            <select style={inp} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="">Select</option>
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Phone Number</label>
            <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Email Address *</label>
            <input style={inp} type="text" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. patient@gmail.com" />
          </div>
        </div>

        {error && <div style={{ background: '#fdf0f0', color: '#e05c5c', padding: '9px 13px', borderRadius: 8, fontSize: 13, marginBottom: 14, border: '1px solid #f5c4c4' }}>❌ {error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
            style={{ flex: 1, background: saving || !form.name.trim() ? '#cbd5e1' : 'linear-gradient(135deg,#2a6049,#1c4232)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ Saving…' : '✅ Register Patient'}
          </button>
          <button onClick={onSkip} style={{ background: '#f5f7f5', color: '#7a9688', border: '1px solid #e4ece7', borderRadius: 10, padding: '12px 18px', cursor: 'pointer', fontSize: 13 }}>Skip</button>
        </div>
      </div>
    </div>
  );
}


// ─── Prescription Card ──────────────────────────────────────────────────────────
function PrescriptionCard({ data, onCreateOrder, orderCreated }) {
  const { patient_name, medicines = [], order_date, order_time } = data || {};
  if (!data) return null;
  const hasAnyMedicine = medicines.some(m => m.medicine);


  return (
    <div className="fade-in" style={{ background: '#fff', border: '1px solid #e4ece7', borderRadius: 14, padding: 20, maxWidth: 620, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p style={{ color: '#7a9688', fontSize: 13, marginBottom: 14 }}>I've extracted the prescription details and cross-referenced inventory.</p>
      <div style={{ background: '#f5f7f5', borderRadius: 10, padding: '10px 16px', marginBottom: 14, border: '1px solid #e4ece7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
        <div><span style={{ color: '#7a9688' }}>Patient: </span><strong>{patient_name}</strong></div>
        <div style={{ color: '#7a9688', fontSize: 12 }}>{order_date} · {order_time}</div>
      </div>
      {medicines.length > 0 ? (
        <div style={{ border: '1px solid #e4ece7', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: '#1a2e25', padding: '10px 14px', gap: 8 }}>
            {['Medicine', 'Dosage', 'Freq', 'Days', 'Qty', 'Subtotal'].map(h => (
              <div key={h} style={{ color: '#7a9688', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {medicines.map((med, i) => (
            <div key={i}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '11px 14px', gap: 8, background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f0f5f2', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{med.medicine_name}</div>
                  {med.medicine ? (
                    <span style={{ fontSize: 10, fontWeight: 700, background: med.stock_status?.sufficient ? '#eaf2ed' : '#fee2e2', color: med.stock_status?.sufficient ? '#2a6049' : '#e05c5c', padding: '1px 6px', borderRadius: 20, marginTop: 3, display: 'inline-block' }}>
                      {med.stock_status?.sufficient ? `✓ ${med.medicine.stock} in stock` : `⚠ Only ${med.medicine.stock} left`}
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#fdf3e4', color: '#7a4820', padding: '1px 6px', borderRadius: 20, marginTop: 3, display: 'inline-block' }}>Not in DB</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#7a9688' }}>{med.dosage}</div>
                <div style={{ fontSize: 13, color: '#7a9688' }}>{med.frequency}</div>
                <div style={{ fontSize: 13, color: '#7a9688' }}>{med.days}d</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{med.quantity}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: med.total_price ? '#2a6049' : '#7a9688' }}>{med.total_price ? `$${med.total_price}` : '—'}</div>
              </div>
              {med.medicine && !med.stock_status?.sufficient && (
                <div style={{ background: '#fdf0f0', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e05c5c', borderTop: '1px solid #fee2e2' }}>
                  <Icon.Alert /> Shortage of {med.stock_status.shortage} pills
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 14px', gap: 8, background: '#f5f7f5', borderTop: '2px solid #e4ece7' }}>
            <div style={{ gridColumn: '1 / 6', fontWeight: 700, fontSize: 14 }}>Grand Total ({medicines.length} medicine{medicines.length > 1 ? 's' : ''})</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#2a6049' }}>${grand_total}</div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fdf3e4', borderRadius: 10, padding: 14, marginBottom: 14, color: '#7a4820', fontSize: 13 }}>⚠️ Could not extract medicine details. Please try again.</div>
      )}
      {!orderCreated ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCreateOrder} disabled={!hasAnyMedicine} style={{ background: hasAnyMedicine ? '#2a6049' : '#7a9688', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', cursor: hasAnyMedicine ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14 }}>Create Order</button>
        </div>
      ) : (
        <div style={{ background: '#eaf2ed', border: '1px solid #c8ddd1', borderRadius: 8, padding: '10px 14px', color: '#2a6049', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.Check /> Order created successfully!
        </div>
      )}
    </div>
  );
}

// ─── Live Context Panel ─────────────────────────────────────────────────────────
function LiveContextPanel({ extractedData, loading, onRegisterNewPatient, countdown, step, liveInventory = [] }) {
  const { customer, medicines = [], patient_name } = extractedData || {};
  return (
    <div style={{ width: 300, borderLeft: '1px solid #e4ece7', background: '#fff', overflowY: 'auto', flexShrink: 0, padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Live Context</h3>
      <p style={{ color: '#7a9688', fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>This pane updates as the AI processes text/voice input.</p>


      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7a9688', fontSize: 13 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #e4ece7', borderTopColor: '#2a6049', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Processing with Ollama AI...
        </div>
      )}
      {!loading && extractedData && (
        <>
          <div style={{ background: '#f5f7f5', borderRadius: 10, padding: 14, marginBottom: 14, border: '1px solid #f0f5f2' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7a9688', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' }}>Customer Found</div>
            {customer ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eaf2ed', color: '#1c4232', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{customer.name.charAt(0)}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{customer.name}</div>
                </div>
                {customer.allergies && customer.allergies !== 'None' ? (
                  <div style={{ fontSize: 12, color: '#e05c5c', marginBottom: 4 }}>⚠️ Allergies: {customer.allergies}</div>
                ) : (
                  <div style={{ fontSize: 12, color: '#7a9688', marginBottom: 4 }}>No known allergies.</div>
                )}
                {customer.last_visit && <div style={{ fontSize: 12, color: '#7a9688' }}>Last visit: {new Date(customer.last_visit).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>}
                {customer.phone && <div style={{ fontSize: 12, color: '#7a9688', marginTop: 2 }}>📞 {customer.phone}</div>}
              </>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: '#e05c5c', fontWeight: 600, marginBottom: 8 }}>❌ "{patient_name}" not in database</div>
                <div style={{ fontSize: 12, color: '#7a9688', marginBottom: 10 }}>This patient needs to be registered.</div>
                <button onClick={() => onRegisterNewPatient(patient_name)} style={{ width: '100%', background: '#2a6049', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon.UserPlus /> Register New Patient
                </button>
                {countdown !== null && <CountdownBar seconds={countdown} total={5} label="Auto-redirecting in" color="#e05c5c" />}
              </div>
            )}
          </div>
          <div style={{ background: '#f5f7f5', borderRadius: 10, padding: 14, border: '1px solid #f0f5f2' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7a9688', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' }}>Medicine Validation ({medicines.length})</div>
            {medicines.length === 0 ? <div style={{ fontSize: 13, color: '#c97c2a' }}>⚠️ No medicines detected.</div> : (
              medicines.map((med, i) => (
                <div key={i} style={{ marginBottom: i < medicines.length - 1 ? 12 : 0, paddingBottom: i < medicines.length - 1 ? 12 : 0, borderBottom: i < medicines.length - 1 ? '1px solid #e4ece7' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{med.medicine_name}</div>
                    {med.medicine && <span style={{ background: med.stock_status?.sufficient ? '#eaf2ed' : '#fee2e2', color: med.stock_status?.sufficient ? '#2a6049' : '#e05c5c', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>{med.stock_status?.sufficient ? 'OK' : `LOW (${med.medicine.stock})`}</span>}
                  </div>
                  {med.medicine ? (
                    <div style={{ fontSize: 11, color: '#7a9688' }}>${med.medicine.price}/pill · {med.medicine.category}<br />Qty: {med.quantity} · Subtotal: ${med.total_price}</div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#c97c2a' }}>Not found in database</div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      {!loading && !extractedData && <div style={{ color: '#7a9688', fontSize: 13, fontStyle: 'italic', textAlign: 'center', marginTop: 40 }}>Waiting for input...</div>}
    </div>
  );
}

// ─── Ollama Banner ──────────────────────────────────────────────────────────────
function OllamaStatusBanner({ status }) {
  if (!status || status.ok) return null;
  return (
    <div style={{ background: '#fdf0f0', borderBottom: '1px solid #f5c4c4', padding: '10px 24px', fontSize: 13, color: '#e05c5c', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon.Alert />
      <span><strong>Ollama not detected.</strong> Run: <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>ollama serve</code> then <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>ollama pull llama3.2</code></span>
    </div>
  );
}

// ─── Purchase History ───────────────────────────────────────────────────────────
function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/purchase-history`).then(r => { setHistory(r.data); setLoading(false); }); }, []);
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Purchase History</h2>
      {loading ? <div style={{ color: '#7a9688' }}>Loading...</div> : history.length === 0 ? <div style={{ color: '#7a9688' }}>No orders yet.</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f7f5', borderBottom: '2px solid #e4ece7' }}>
                {['Order #', 'Patient', 'Medicine', 'Qty', 'Dosage', 'Price', 'Date', 'Time', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#7a9688', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f5f2' }}>
                  <td style={{ padding: '10px 14px', color: '#2a6049', fontWeight: 600 }}>#{row.id}</td>
                  <td style={{ padding: '10px 14px' }}>{row.customer_name}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{row.medicine_name}</td>
                  <td style={{ padding: '10px 14px' }}>{row.quantity}</td>
                  <td style={{ padding: '10px 14px', color: '#7a9688' }}>{row.dosage}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#2a6049' }}>${row.total_price}</td>
                  <td style={{ padding: '10px 14px', color: '#7a9688', whiteSpace: 'nowrap' }}>{row.order_date}</td>
                  <td style={{ padding: '10px 14px', color: '#7a9688' }}>{row.order_time}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ background: '#eaf2ed', color: '#2a6049', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{row.status || 'Completed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Customers Page ─────────────────────────────────────────────────────────────
function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/customers`).then(r => { setCustomers(r.data); setLoading(false); }); }, []);
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Customers</h2>
      {loading ? <div style={{ color: '#7a9688' }}>Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {customers.map(c => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #e4ece7', borderRadius: 12, padding: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eaf2ed', color: '#1c4232', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{c.name.charAt(0)}</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#7a9688', marginBottom: 2 }}>📞 {c.phone}</div>
              {c.allergies !== 'None' && <div style={{ fontSize: 12, color: '#e05c5c', marginBottom: 2 }}>⚠️ Allergies: {c.allergies}</div>}
              {c.last_visit && <div style={{ fontSize: 12, color: '#7a9688', marginTop: 6 }}>Last visit: {new Date(c.last_visit).toLocaleDateString()}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inventory Page ─────────────────────────────────────────────────────────────
function InventoryPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { axios.get(`${API}/medicines`).then(r => { setMedicines(r.data); setLoading(false); }); }, []);
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Inventory</h2>
      {loading ? <div style={{ color: '#7a9688' }}>Loading...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f7f5', borderBottom: '2px solid #e4ece7' }}>
                {['Medicine', 'Generic Name', 'Category', 'Dosage', 'Price/Unit', 'Stock', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#7a9688', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => {
                const isLow = m.stock < m.min_stock;
                return (
                  <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f5f2' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '10px 14px', color: '#7a9688' }}>{m.generic_name}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: '#f0f5f2', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.category}</span></td>
                    <td style={{ padding: '10px 14px', color: '#7a9688' }}>{m.dosage}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>${m.price}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: isLow ? '#e05c5c' : '#1a2e25' }}>{m.stock}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: isLow ? '#fee2e2' : '#eaf2ed', color: isLow ? '#e05c5c' : '#2a6049', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{isLow ? 'LOW STOCK' : 'In Stock'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─── Bill View ──────────────────────────────────────────────────────────────────
function BillView({ patient, medicines, onDone }) {
  const selected = medicines.filter(m => m.selected !== false);
  const grand = selected.reduce((s, m) => s + parseFloat(m.price) * Math.max(1, parseInt(m.qty) || 1), 0).toFixed(2);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=720,height=620');
    const rows = selected.map(m => {
      const qty = Math.max(1, parseInt(m.qty) || 1);
      return `<tr><td>${m.name}</td><td>${m.dosage || m.dosageLabel || '-'}</td><td style="text-align:center">${qty}</td><td style="text-align:right">₹${parseFloat(m.price).toFixed(2)}</td><td style="text-align:right">₹${(parseFloat(m.price) * qty).toFixed(2)}</td></tr>`;
    }).join('');
    w.document.write(`<!DOCTYPE html><html><head><title>Bill</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}.hdr{border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:20px}h1{font-size:22px;margin:0 0 6px}table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#1a2e25;color:#fff;padding:8px 12px;text-align:left;font-size:12px}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px}.tot{font-size:16px;font-weight:700;text-align:right;padding:8px 0}.ft{margin-top:24px;font-size:11px;color:#666;text-align:center}</style></head><body><div class="hdr"><h1>HackfusionRX Pharmacy</h1><div>Patient: <strong>${patient?.name || 'Walk-in'}</strong></div><div>${dateStr} · ${timeStr}</div></div><table><thead><tr><th>Medicine</th><th>Dosage</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${rows}</tbody></table><div class="tot">Grand Total: ₹${grand}</div><div class="ft">Thank you for visiting HackfusionRX</div></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e4ece7', borderRadius: 14, padding: 24, maxWidth: 660 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2e25' }}>🧾 Bill Generated</div>
          <div style={{ fontSize: 13, color: '#7a9688', marginTop: 4 }}>Patient: <strong>{patient?.name || 'Walk-in'}</strong> · {dateStr} · {timeStr}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handlePrint} style={{ background: '#2a6049', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>🖨 Print / PDF</button>
          <button onClick={onDone} style={{ background: '#f0f5f2', color: '#1a2e25', border: '1px solid #e4ece7', borderRadius: 8, padding: '8px 14px', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>New Sale</button>
        </div>
      </div>
      <div style={{ border: '1px solid #e4ece7', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.6fr 1fr 1fr', background: '#1a2e25', padding: '10px 14px', gap: 8 }}>
          {['Medicine', 'Dosage', 'Qty', 'Unit Price', 'Total'].map(h => <div key={h} style={{ color: '#7a9688', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>)}
        </div>
        {selected.map((m, i) => {
          const qty = Math.max(1, parseInt(m.qty) || 1);
          return (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.6fr 1fr 1fr', padding: '11px 14px', gap: 8, background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f0f5f2', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: '#7a9688' }}>{m.dosage || '-'}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{qty}</div>
              <div style={{ fontSize: 13 }}>₹{parseFloat(m.price).toFixed(2)}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2a6049' }}>₹{(parseFloat(m.price) * qty).toFixed(2)}</div>
            </div>
          );
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.6fr 1fr 1fr', padding: '12px 14px', gap: 8, background: '#f5f7f5', borderTop: '2px solid #e4ece7' }}>
          <div style={{ gridColumn: '1 / 5', fontWeight: 700, fontSize: 14 }}>Grand Total ({selected.length} item{selected.length !== 1 ? 's' : ''})</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#2a6049' }}>₹{grand}</div>
        </div>
      </div>
      <div style={{ background: '#eaf2ed', border: '1px solid #c8ddd1', borderRadius: 8, padding: '10px 14px', color: '#2a6049', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon.Check /> Order created &amp; inventory updated!
      </div>
    </div>
  );
}


// ─── Medicine Selection Table ────────────────────────────────────────────────────
function MedicineSelectionTable({ medicines, patient, inputType, symptomText, onBillCreated, setAgentActivity }) {
  const [rows, setRows] = useState(() => medicines.map(m => ({ ...m, selected: true, qty: m.qty || 1, editName: m.name, editDosage: m.dosage || '' })));
  const [editMode, setEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [showRxUpload, setShowRxUpload] = useState(false);
  const [billDone, setBillDone] = useState(false);          // true after bill created
  const [emailTo, setEmailTo] = useState(patient?.email || '');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | done | error
  const [createdRows, setCreatedRows] = useState([]);      // rows that were billed

  const TEAM_EMAILS = [
    { name: 'Shreya', email: 'shreeyakale1207@gmail.com' },
    { name: 'Ishita', email: 'ishitadzope1906@gmail.com' },
    { name: 'Vrushab', email: 'vrushabhjain9172@gmail.com' },
  ];


  // Called when PrescriptionUploadPage finds medicines — merges them into the table
  const onRxSuccess = (newMeds) => {
    setRows(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const toAdd = newMeds.filter(m => !existingIds.has(m.id)).map(m => ({ ...m, selected: true, qty: m.qty || 1, editName: m.name, editDosage: m.dosage || '' }));
      return [...prev, ...toAdd];
    });
  };

  const toggle = id => setRows(r => r.map(x => x.id === id ? { ...x, selected: !x.selected } : x));
  const toggleAll = () => { const all = rows.every(r => r.selected); setRows(r => r.map(x => ({ ...x, selected: !all }))); };
  const setQty = (id, v) => setRows(r => r.map(x => x.id === id ? { ...x, qty: v } : x));
  const setName = (id, v) => setRows(r => r.map(x => x.id === id ? { ...x, editName: v } : x));
  const setDosage = (id, v) => setRows(r => r.map(x => x.id === id ? { ...x, editDosage: v } : x));
  const handleSave = () => { setRows(r => r.map(x => ({ ...x, name: x.editName, dosage: x.editDosage }))); setEditMode(false); };

  const handleCreateBill = async () => {
    const sel = rows.filter(r => r.selected);
    if (!sel.length) { setError('Select at least one medicine.'); return; }
    setCreating(true); setError('');
    if (setAgentActivity) setAgentActivity("🛒 Check-out Agent — finalizing order integration…");
    try {
      for (const med of sel) {
        const qty = Math.max(1, parseInt(med.qty) || 1);
        await axios.post(`${API}/create-order`, {
          customer_id: patient?.id || null,
          customer_name: patient?.name || 'Walk-in',
          customer_phone: patient?.phone || '',
          customer_age: patient?.age || '',
          customer_gender: patient?.gender || '',
          customer_email: patient?.email || '',
          bill_type: inputType === 'symptom' ? 'OTC' : 'Rx',
          medicine_id: med.id || null,
          medicine_name: med.name,
          dosage: med.dosage || med.dosageLabel || '',
          quantity: qty,
          price_per_unit: med.price,
          notes: `${inputType === 'symptom' ? 'Symptom-based' : 'Prescription'} sale via AI Assistant`,
        });
      }
      // Bill created. Show email panel — onBillCreated is called from Skip or after email sent.
      setBillDone(true);
      setCreatedRows(sel);
      setEmailTo(patient?.email || '');
    } catch (err) { setError(err.response?.data?.error || err.message); }
    if (setAgentActivity) setAgentActivity("");
    setCreating(false);
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailTo.includes('@')) return;
    setEmailStatus('sending');
    try {
      for (const med of createdRows) {
        const qty = Math.max(1, parseInt(med.qty) || 1);
        await fetch('http://localhost:3001/api/send-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailTo,
            transaction: {
              patientName: patient?.name || 'Walk-in',
              phone: patient?.phone || '',
              age: patient?.age || '',
              gender: patient?.gender || '',
              date: new Date().toISOString().split('T')[0],
              medicine: med.name,
              dosage: med.dosage || med.dosageLabel || '',
              quantity: qty,
              unitPrice: med.price,
              total: (parseFloat(med.price) * qty).toFixed(2),
              type: inputType === 'symptom' ? 'OTC' : 'Rx',
            }
          })
        });
      }
      setEmailStatus('done');
      setTimeout(() => onBillCreated(createdRows), 1500); // advance parent after showing "Sent!"
    } catch (err) {
      console.error('Email error:', err);
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };


  const selCount = rows.filter(r => r.selected).length;
  const grand = rows.filter(r => r.selected).reduce((s, r) => s + parseFloat(r.price) * (Math.max(1, parseInt(r.qty) || 1)), 0).toFixed(2);
  const allSel = rows.every(r => r.selected);
  const inS = { border: '1px solid #93c5fd', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', width: '100%' };

  return (
    <div style={{ background: '#fff', border: '1px solid #e4ece7', borderRadius: 14, padding: 20, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{inputType === 'symptom' ? `💊 Suggested for "${symptomText}"` : '🧾 Prescription Table'}</div>
          <div style={{ fontSize: 12, color: '#7a9688', marginTop: 3 }}>{inputType === 'medicine' ? `${rows.length} medicine${rows.length !== 1 ? 's' : ''}` : `${selCount} selected`} · Total: <strong style={{ color: '#2a6049' }}>₹{grand}</strong></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editMode
            ? <button onClick={handleSave} style={{ background: '#2a6049', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>💾 Save</button>
            : <button onClick={() => setEditMode(true)} style={{ background: '#f5f7f5', color: '#1a2e25', border: '1px solid #e4ece7', borderRadius: 8, padding: '8px 14px', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>✏️ Edit</button>
          }
          <button onClick={handleCreateBill} disabled={creating || selCount === 0} style={{ background: selCount > 0 && !creating ? '#2a6049' : '#7a9688', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 13, cursor: selCount > 0 && !creating ? 'pointer' : 'not-allowed' }}>
            {creating ? '⏳ Creating...' : '🧾 Create Bill'}
          </button>
        </div>
      </div>

      {/* ── Email panel (visible only after Create Bill) ── */}
      {billDone && (
        <div style={{ margin: '14px 0', background: '#eaf2ed', border: '1.5px solid #b8d9c7', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2e25', marginBottom: 10 }}>
            ✅ Bill created! Send it via email?
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {TEAM_EMAILS.map(c => (
              <button key={c.email} onClick={() => setEmailTo(c.email)}
                style={{
                  padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: '1.5px solid ' + (emailTo === c.email ? '#2a6049' : '#c8ddd1'),
                  background: emailTo === c.email ? '#2a6049' : '#fff',
                  color: emailTo === c.email ? '#fff' : '#2a6049'
                }}>
                {c.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)}
              placeholder="Enter email address…"
              style={{ flex: 1, padding: '9px 13px', border: '1.5px solid #b8d9c7', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            <button onClick={handleSendEmail} disabled={emailStatus === 'sending' || emailStatus === 'done'}
              style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: emailStatus === 'done' ? '#2a6049' : emailStatus === 'error' ? '#e05c5c' : '#1c4232', color: '#fff', whiteSpace: 'nowrap'
              }}>
              {emailStatus === 'done' ? '✓ Sent!' : emailStatus === 'sending' ? 'Sending…' : emailStatus === 'error' ? '✗ Failed' : '📧 Send Email'}
            </button>
            <button onClick={() => onBillCreated(createdRows)}
              style={{
                padding: '9px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid #c8ddd1', background: '#fff', color: '#7a9688'
              }}>
              Skip
            </button>
          </div>
          {emailStatus === 'error' && <div style={{ color: '#e05c5c', fontSize: 12, marginTop: 6 }}>Failed. Check that the backend is running with GMAIL_PASS set.</div>}
        </div>
      )}

      <div style={{ border: '1px solid #e4ece7', borderRadius: 10, overflow: 'hidden' }}>
        {inputType === 'medicine' ? (<>
          {/* Patient info header */}
          {patient && <div style={{ background: '#f5f7f5', padding: '10px 16px', borderBottom: '1px solid #e4ece7', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7a9688' }}>
            <span>Patient: <strong style={{ color: '#1a2e25' }}>{patient.name}</strong></span>
            <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          </div>}
          {/* 6-col header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.9fr 0.7fr 0.6fr 0.6fr 1fr', background: '#1a2e25', padding: '10px 14px', gap: 8, alignItems: 'center' }}>
            {['Medicine', 'Dosage', 'Freq', 'Days', 'Qty', 'Subtotal'].map(h => <div key={h} style={{ color: '#7a9688', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>)}
          </div>
          {/* Data rows + shortage warning */}
          {rows.map((m, i) => {
            const qty = Math.max(1, parseInt(m.qty) || 1);
            const subtotal = (parseFloat(m.price) * qty).toFixed(2);
            const shortage = m.stock < qty;
            return (<React.Fragment key={m.id}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.9fr 0.7fr 0.6fr 0.6fr 1fr', padding: '12px 14px', gap: 8, background: i % 2 === 0 ? '#fff' : '#fafafa', borderTop: '1px solid #f0f5f2', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: shortage ? '#e05c5c' : '#2a6049', marginTop: 2 }}>
                    {shortage ? `⚠ Only ${m.stock} left` : `✓ ${m.stock} in stock`}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#7a9688' }}>{m.dosageLabel || m.dosage || '1 pill'}</div>
                <div style={{ fontSize: 13, color: '#7a9688' }}>{m.freqLabel || `${m.frequency || 1}x day`}</div>
                <div style={{ fontSize: 13, color: '#7a9688' }}>{m.daysLabel || `${m.duration || 1}d`}</div>
                <input
                  type="text" inputMode="numeric" value={m.qty}
                  onChange={e => setQty(m.id, e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={e => { if (!e.target.value || parseInt(e.target.value) < 1) setQty(m.id, 1); }}
                  style={{ width: 52, border: '1px solid #e4ece7', borderRadius: 6, padding: '4px 6px', fontSize: 13, outline: 'none', textAlign: 'center', fontWeight: 700 }}
                />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2a6049' }}>₹{subtotal}</div>
              </div>
              {shortage && <div style={{ background: '#fdf0f0', borderTop: '1px solid #f5c4c4', padding: '7px 14px', fontSize: 12, color: '#e05c5c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span>△ Shortage of {qty - m.stock} {m.doseUnit || 'pills'} — only {m.stock} available in stock</span>
                <button onClick={() => setShowRxUpload(true)} style={{ background: '#e05c5c', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>📋 Upload Prescription</button>
              </div>}
            </React.Fragment>);
          })}
          {/* Grand total */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.9fr 0.7fr 0.6fr 0.6fr 1fr', padding: '13px 14px', gap: 8, background: '#f5f7f5', borderTop: '2px solid #e4ece7', alignItems: 'center' }}>
            <div style={{ gridColumn: '1 / 6', fontWeight: 800, fontSize: 15 }}>Grand Total ({rows.length} medicine{rows.length !== 1 ? 's' : ''})</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#2a6049' }}>₹{grand}</div>
          </div>
        </>) : (<>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 2fr 1.2fr 70px 1fr 1fr', background: '#1a2e25', padding: '10px 14px', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ cursor: 'pointer' }} />
            {['Medicine', 'Dosage', 'Qty', 'Unit Price', 'Total'].map(h => <div key={h} style={{ color: '#7a9688', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{h}</div>)}
          </div>
          {rows.map((m, i) => {
            const qty = Math.max(1, parseInt(m.qty) || 1);
            const total = (parseFloat(m.price) * qty).toFixed(2);
            return (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '36px 2fr 1.2fr 70px 1fr 1fr', padding: '11px 14px', gap: 8, background: m.selected ? (i % 2 === 0 ? '#fff' : '#fafafa') : '#f5f7f5', borderTop: '1px solid #f0f5f2', alignItems: 'center', opacity: m.selected ? 1 : 0.5 }}>
                <input type="checkbox" checked={m.selected} onChange={() => toggle(m.id)} style={{ cursor: 'pointer' }} />
                <div>
                  {editMode && m.selected ? <input value={m.editName} onChange={e => setName(m.id, e.target.value)} style={inS} />
                    : <><div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, background: m.stock < m.min_stock ? '#fee2e2' : '#eaf2ed', color: m.stock < m.min_stock ? '#e05c5c' : '#2a6049', padding: '1px 6px', borderRadius: 20, display: 'inline-block' }}>
                        {m.stock < m.min_stock ? `⚠ ${m.stock} left` : `✓ ${m.stock} in stock`}
                      </span></>}
                </div>
                <div>{editMode && m.selected ? <input value={m.editDosage} onChange={e => setDosage(m.id, e.target.value)} style={inS} /> : <span style={{ fontSize: 13, color: '#7a9688' }}>{m.dosage || '-'}</span>}</div>
                <input type="text" inputMode="numeric" value={m.qty} onChange={e => setQty(m.id, e.target.value.replace(/[^0-9]/g, ''))} onBlur={e => { if (!e.target.value || parseInt(e.target.value) < 1) setQty(m.id, 1); }} disabled={!m.selected} style={{ width: 64, border: '1px solid #e4ece7', borderRadius: 6, padding: '4px 8px', fontSize: 13, outline: 'none', background: m.selected ? '#fff' : '#f0f5f2', color: '#1a2e25', textAlign: 'center' }} />
                <div style={{ fontSize: 13 }}>₹{parseFloat(m.price).toFixed(2)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.selected ? '#2a6049' : '#7a9688' }}>{m.selected ? `₹${total}` : '—'}</div>
              </div>
            );
          })}
          <div style={{ display: 'grid', gridTemplateColumns: '36px 2fr 1.2fr 70px 1fr 1fr', padding: '12px 14px', gap: 8, background: '#f5f7f5', borderTop: '2px solid #e4ece7' }}>
            <div style={{ gridColumn: '1 / 6', fontWeight: 700, fontSize: 14 }}>Grand Total ({selCount} selected)</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#2a6049' }}>₹{grand}</div>
          </div>
        </>)}
      </div>

      {error && <div style={{ marginTop: 10, background: '#fdf0f0', color: '#e05c5c', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>❌ {error}</div>}
      {/* Prescription OCR modal — opened from shortage warning */}
      {showRxUpload && <PrescriptionUploadPage patient={patient} onBack={() => setShowRxUpload(false)} onSuccess={(meds) => { setShowRxUpload(false); onRxSuccess(meds); }} />}
    </div>
  );
}

// ─── AI Assistant Page (Guided Sale Flow) ──────────────────────────────────────
// registeredPatient: passed after new patient is registered — skips name-lookup step
function AssistantPage({ ollamaStatus, onNavigateToRegister, registeredPatient, onRegisteredPatientUsed }) {
  const initialStep = registeredPatient ? 'input' : 'name';
  const [step, setStep] = useState(initialStep);
  const [messages, setMessages] = useState(() => {
    if (registeredPatient) {
      return [{ id: 1, role: 'assistant', type: 'text', text: `✅ Patient registered: **${registeredPatient.name}**\n\nNow please say the medicines needed.\n\nExample: "Amoxicillin 250mg 1 pill 3 times a day for 7 days"` }];
    }
    return [{ id: 1, role: 'assistant', type: 'text', text: "👋 Welcome! Please type or speak the patient's full name to get started." }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [patientContext, setPatientContext] = useState(registeredPatient || null);
  const [liveInventory, setLiveInventory] = useState([]);

  const [rxWarning, setRxWarning] = useState(null); // { names: [...] } or null
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [agentActivity, setAgentActivity] = useState(''); // floating mini-toast

  // Helper: show agent message for at least 3 seconds
  const showAgent = (msg) => {
    setAgentActivity(msg);
    return Date.now(); // returns start time
  };
  const clearAgent = async (startTime) => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 3000 - elapsed);
    await new Promise(r => setTimeout(r, remaining));
    setAgentActivity('');
  };

  // Fetch live inventory for context panel
  useEffect(() => {
    axios.get(`${API}/medicines`).then(r => setLiveInventory(r.data)).catch(() => { });
  }, [step]); // refresh each step change

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const msgIdRef = useRef(2);
  const autoStarted = useRef(false);
  // Refs so startRecording always reads the CURRENT step/handler (avoids stale closure bug)
  const stepRef = useRef(step);
  const handleInputRef = useRef(null);

  // Clear parent's registeredPatient after we've consumed it (prevents stale state on re-navigation)
  useEffect(() => { if (registeredPatient && onRegisteredPatientUsed) onRegisteredPatientUsed(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { if (!autoStarted.current) { autoStarted.current = true; setTimeout(() => startRecording(), 600); } }, []);
  // ✅ Auto-start mic when patient is found and step transitions to 'input'
  useEffect(() => {
    if (step === 'input') {
      const t = setTimeout(() => startRecording(), 800); // short delay so TTS/message renders first
      return () => clearTimeout(t);
    }
  }, [step]);



  const addMsg = (msg) => { const id = msgIdRef.current++; setMessages(m => [...m, { id, ...msg }]); return id; };

  const resetFlow = () => {
    setStep('name'); setPatientContext(null);
    setMessages([{ id: msgIdRef.current++, role: 'assistant', type: 'text', text: "👋 New sale started. Please type or click the mic to speak the patient's name." }]);
    // Recording does NOT auto-restart — user must click the mic button manually
  };

  const lookupPatient = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    addMsg({ role: 'user', type: 'text', text: text.trim() });
    setInput(''); setLoading(true);
    const t0 = showAgent('🔍 Patient Lookup Agent — searching database…');
    try {
      const { data } = await axios.get(`${API}/customers/search`, { params: { name: text.trim() } });
      const found = data.found ? data.customer : null;
      if (found) {
        setPatientContext(found); setStep('input');
        addMsg({ role: 'assistant', type: 'text', text: `✅ Patient Found: **${found.name}**${found.allergies && found.allergies !== 'None' ? `\n⚠️ Allergies: ${found.allergies}` : '\nAllergies: None'}\n\nNow please say the medicines needed.\n\nExample: "Amoxicillin 250mg 1 pill 3 times a day for 7 days"\n\n🎤 *Click the mic button to speak, or type below.*` });
      } else {
        addMsg({ role: 'assistant', type: 'text', text: `❌ Patient "${text.trim()}" not found.\n\nRedirecting to registration in 3 seconds...` });
        setTimeout(() => onNavigateToRegister(text.trim()), 3000);
      }
    } catch (err) { addMsg({ role: 'assistant', type: 'text', text: `❌ Error: ${err.message}` }); }
    setLoading(false); await clearAgent(t0);
  }, [loading]);

  const processInput = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    addMsg({ role: 'user', type: 'text', text: text.trim() });
    setInput(''); setLoading(true);
    const t0 = showAgent('🤖 Prescription Agent — parsing medicines from input…');
    try {
      const allMeds = (await axios.get(`${API}/medicines`)).data;
      const type = detectType(text);
      let matched;
      if (type === 'symptom') {
        matched = symptomMeds(text, allMeds);
      } else {
        matched = parsePrescription(text, allMeds);
        if (!matched.length) matched = medicineMeds(text, allMeds);
      }

      try {
        const stockRes = await fetch('https://agentic-ai-499ab-default-rtdb.firebaseio.com/stock.json');
        const stockData = await stockRes.json();
        if (stockData) {
          const stockList = Object.values(stockData);
          const rxNames = matched
            .filter(med => {
              const lowerName = (med.name || '').toLowerCase();
              return stockList.some(s => {
                if (!s.prescriptionRequired) return false;
                const sName = (s.medicineName || '').toLowerCase();
                return lowerName.includes(sName) || sName.includes(lowerName);
              });
            })
            .map(med => med.name);
          if (rxNames.length > 0) {
            setRxWarning({ names: rxNames });
          }
        }
      } catch (_) { /* silently ignore if stock ledger unavailable */ }

      if (!matched.length) {
        addMsg({ role: 'assistant', type: 'text', text: `⚠️ No medicines found for "${text.trim()}". Showing all available medicines.` });
        matched = allMeds;
      } else {
        addMsg({
          role: 'assistant', type: 'text', text: type === 'symptom'
            ? `🔍 Detected **symptoms** — showing ${matched.length} suggested medicine(s). Select and create the bill.`
            : `🔍 Detected **${matched.length} medicine${matched.length !== 1 ? 's' : ''}** — quantities calculated from prescription.`
        });
      }
      addMsg({ role: 'assistant', type: 'selection', medicines: matched, inputType: type, symptomText: text.trim() });
      setStep('select');
    } catch (err) { addMsg({ role: 'assistant', type: 'text', text: `❌ Error: ${err.message}` }); }
    setLoading(false); await clearAgent(t0);
  }, [loading]);

  const handleInput = useCallback((text) => {
    if (step === 'name') lookupPatient(text);
    else if (step === 'input') processInput(text);
  }, [step, lookupPatient, processInput]);

  // Keep handleInputRef in sync so startRecording always calls the latest version
  useEffect(() => { handleInputRef.current = handleInput; }, [handleInput]);

  const handleBillCreated = (medicineRows) => {
    setMessages(m => [...m.filter(msg => msg.type !== 'selection'), { id: msgIdRef.current++, role: 'assistant', type: 'bill', medicines: medicineRows }]);
    setStep('bill');
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      const t = Array.from(e.results).map(x => x[0].transcript.trim()).join(' ').trim();
      setInput(t);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      const silenceMs = stepRef.current === 'input' ? 5000 : 2000;
      silenceTimerRef.current = setTimeout(() => {
        stopRecording();
        if (t.trim().length < 3) {
          addMsg({ role: 'assistant', type: 'text', text: "🎤 Sorry, I didn't catch that. Could you repeat? Click the mic button when ready." });
          return;
        }
        handleInputRef.current?.(t);
      }, silenceMs);
    };
    r.onerror = () => stopRecording();
    r.onend = () => setRecording(false);
    try { r.start(); recognitionRef.current = r; setRecording(true); } catch (e) { }
  };

  const stopRecording = () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); recognitionRef.current?.stop(); setRecording(false); };

  const stepColors = { name: ['#eaf2ed', '#1c4232'], input: ['#fdf3e4', '#7a4820'], select: ['#ede9fe', '#5b21b6'], bill: ['#eaf2ed', '#2a6049'] };
  const stepLabels = { name: '🔍 Step 1: Patient Name', input: `💬 Step 2: Medicines / Symptoms`, select: '☑️ Step 3: Select & Bill', bill: '✅ Bill Created' };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* ── Main chat column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#f5f7f5', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #e4ece7', flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2a6049, #1c4232)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>HackfusionRX Assistant</div>
            <div style={{ fontSize: 12, color: '#2a6049', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2a6049' }} /> Online · AI Guided Sale
            </div>
          </div>
          <div style={{ background: stepColors[step][0], color: stepColors[step][1], fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{stepLabels[step]}</div>
        </div>

        {recording && (
          <div style={{ background: '#fdf0f0', border: '1px solid #f5c4c4', borderRadius: 8, padding: '8px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#e05c5c', flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e05c5c' }} /> 🎤 Listening… auto-submits after {step === 'input' ? '5s' : '2s'} silence
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4 }}>
          {messages.map(msg => (
            <div key={msg.id} className="fade-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
              {msg.role === 'assistant' && <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #2a6049, #1c4232)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>}
              {msg.type === 'selection' ? (
                <MedicineSelectionTable medicines={msg.medicines} patient={patientContext} inputType={msg.inputType} symptomText={msg.symptomText} onBillCreated={handleBillCreated} setAgentActivity={setAgentActivity} />
              ) : msg.type === 'bill' ? (
                <BillView patient={patientContext} medicines={msg.medicines} onDone={resetFlow} />
              ) : (
                <div style={{ background: msg.role === 'user' ? '#2a6049' : '#fff', color: msg.role === 'user' ? '#fff' : '#1a2e25', border: msg.role === 'user' ? 'none' : '1px solid #e4ece7', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding: '12px 16px', maxWidth: 520, fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{msg.text}</div>
              )}
              {msg.role === 'user' && <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#2a6049', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P</div>}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #2a6049, #1c4232)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>
              <div style={{ background: '#fff', border: '1px solid #e4ece7', borderRadius: '4px 18px 18px 18px', padding: '12px 18px', color: '#7a9688', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, border: '2px solid #e4ece7', borderTopColor: '#2a6049', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {step === 'name' ? 'Searching patient database...' : 'Matching medicines...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar – only show on name/input steps */}
        {(step === 'name' || step === 'input') && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, background: '#fff', border: `2px solid ${recording ? '#fca5a5' : '#e4ece7'}`, borderRadius: 14, padding: '8px 8px 8px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0 }}>
            <button onClick={recording ? stopRecording : startRecording} style={{ background: recording ? '#fee2e2' : '#2a6049', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: recording ? '#e05c5c' : '#fff', flexShrink: 0 }}>
              {recording ? <Icon.MicOff /> : <Icon.Mic />}
            </button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleInput(input)}
              placeholder={recording ? '🎤 Listening...' : step === 'name' ? 'Type or speak patient name...' : 'Type medicines (e.g. Amoxicillin) or symptoms (e.g. fever)...'}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1a2e25', background: 'transparent', fontStyle: recording ? 'italic' : 'normal' }} />
            <button title="Upload prescription image" style={{ background: '#f5f7f5', border: '1px solid #e4ece7', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a9688', flexShrink: 0 }}>
              <Icon.Upload />
            </button>
            <button onClick={() => handleInput(input)} disabled={loading || !input.trim()} style={{ background: input.trim() && !loading ? '#2a6049' : '#e4ece7', color: input.trim() && !loading ? '#fff' : '#7a9688', border: 'none', borderRadius: 10, width: 40, height: 38, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.Send />
            </button>
          </div>
        )}
      </div>
      <LiveContextPanel
        extractedData={patientContext ? { customer: patientContext, medicines: [], patient_name: patientContext.name } : null}
        loading={loading}
        liveInventory={liveInventory}
        step={step}
        onRegisterNewPatient={onNavigateToRegister}
        countdown={null}
      />

      {/* ─── Rx Warning Popup ─────────────────────────────────────────────── */}
      {rxWarning && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,46,37,.50)',
          backdropFilter: 'blur(6px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440,
            boxShadow: '0 24px 60px rgba(26,46,37,.22)', overflow: 'hidden',
            fontFamily: 'inherit', border: '1px solid #e4ece7', textAlign: 'center'
          }}>
            <div style={{ background: 'linear-gradient(135deg,#fff5f5,#fde8e8)', padding: '28px 24px 18px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: '#fde8e8',
                border: '3px solid #f5c4c4', color: '#e05c5c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, margin: '0 auto 16px'
              }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#1a2e25', fontWeight: 800 }}>
                Prescription Required
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#7a9688', lineHeight: 1.6 }}>
                The following medicine{rxWarning.names.length > 1 ? 's require' : ' requires'} a valid prescription to dispense:
              </p>
              {/* Highlighted medicine name pills */}
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {rxWarning.names.map(name => (
                  <span key={name} style={{
                    background: '#fde8e8', border: '2px solid #f5c4c4',
                    color: '#e05c5c', borderRadius: 30, padding: '7px 18px',
                    fontSize: 15, fontWeight: 800, letterSpacing: 0.3
                  }}>💊 {name}</span>
                ))}
              </div>
              {/* Warning notice */}
              <div style={{
                marginTop: 14, background: '#fff8f0', border: '1px solid #f0d9b5',
                borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#c97c2a', lineHeight: 1.5
              }}>
                ⚠️ <strong>Legal Notice:</strong> Dispensing this medicine without a valid prescription is prohibited under Schedule H drug regulations.
              </div>
            </div>
            <div style={{ padding: '18px 24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Upload Prescription */}
              <button
                onClick={() => { setRxWarning(null); setShowPrescriptionUpload(true); }}
                style={{
                  background: 'linear-gradient(135deg, #2a6049, #1c4232)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '12px 20px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(42,96,73,0.2)'
                }}
              >
                📋 Upload Prescription
              </button>
              {/* Proceed anyway */}
              <button
                onClick={() => setRxWarning(null)}
                style={{
                  background: '#fff5f0', color: '#c97c2a',
                  border: '1px solid #f0d9b5', borderRadius: 10,
                  padding: '11px 20px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ⚠️ Proceed Anyway
              </button>
              {/* Go Back */}
              <button
                onClick={() => { setRxWarning(null); }}
                style={{
                  background: 'transparent', color: '#7a9688',
                  border: 'none', borderRadius: 10,
                  padding: '8px 20px', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Prescription Upload Modal ────────── */}
      {showPrescriptionUpload && (
        <PrescriptionUploadPage
          patient={patientContext}
          onBack={() => setShowPrescriptionUpload(false)}
          setAgentActivity={setAgentActivity}
          onSuccess={(meds) => {
            setShowPrescriptionUpload(false);
            // Add the OCR medicines as a message in the chat
            if (meds && meds.length > 0) {
              addMsg({ role: 'assistant', type: 'selection', medicines: meds, inputType: 'medicine', symptomText: '' });
              setStep('select');
            }
          }}
        />
      )}

      {/* ─── Floating Agent Activity Indicator ─────────────────────────── */}
      {agentActivity && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(26,46,37,0.93)', color: '#fff',
          borderRadius: 40, padding: '10px 22px',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 500, zIndex: 8888,
          backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          whiteSpace: 'nowrap', pointerEvents: 'none'
        }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#6ee7b7', boxShadow: '0 0 6px #6ee7b7' }} />
          {agentActivity}
        </div>
      )}
    </div>
  );
}



// ─── Dashboard ──────────────────────────────────────────────────────────────────
function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { axios.get(`${API}/stats`).then(r => setStats(r.data)); }, []);
  const cards = stats ? [
    { label: "Today's Revenue", value: `$${stats.today_revenue}`, color: '#1c4232', icon: '💰' },
    { label: 'Total Orders', value: stats.total_orders, color: '#2a6049', icon: '📋' },
    { label: 'Customers', value: stats.total_customers, color: '#c97c2a', icon: '👥' },
    { label: 'Low Stock Items', value: stats.low_stock_count, color: '#e05c5c', icon: '⚠️' },
  ] : [];
  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <h2 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>Dashboard</h2>
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {cards.map(card => (
            <div key={card.label} style={{ background: '#fff', border: '1px solid #e4ece7', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#7a9688', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>
      ) : <div style={{ color: '#7a9688' }}>Loading stats...</div>}

      {/* Ask the Assistant block */}
      <div style={{ marginTop: 28, background: '#fff', border: '1px solid #e4ece7', borderRadius: 16, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg, #2a6049, #1c4232)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Bot /></div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#1a2e25' }}>Ask the Assistant</div>
            <div style={{ fontSize: 13, color: '#7a9688', marginTop: 2 }}>Start a guided AI sale or record a purchase</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button
            onClick={() => onNavigate('assistant')}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            style={{ flex: 1, background: 'linear-gradient(135deg, #2a6049, #1c4232)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 2px 8px rgba(37,99,235,0.3)', transition: 'transform 0.15s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Sale
          </button>
          <button
            onClick={() => onNavigate('reports')}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f5f2'}
            onMouseLeave={e => e.currentTarget.style.background = '#f5f7f5'}
            style={{ flex: 1, background: '#f5f7f5', color: '#1a2e25', border: '1px solid #e4ece7', borderRadius: 12, padding: '14px 20px', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.15s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Icons from Dashboard ─────────────────────────────────────────────────────
const IconGrid = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconAI = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
  </svg>
);
const IconCart = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconTrend = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconBellNav = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconUsersNav = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconLogoutNav = ({ s = 17 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconDocNav = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const IconBoxNav = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: <IconGrid />, badge: null, path: "/" },
  { key: "ai", label: "AI Assistant", icon: <IconAI />, badge: null, path: "/" },
  null,
  { key: "purchase", label: "Purchase", icon: <IconCart />, badge: null, path: "/reorder" },
  { key: "sales", label: "Sales", icon: <IconTrend />, badge: null, path: "/billing" },
  { key: "product-mastery", label: "Product Mastery", icon: <IconBoxNav />, badge: null, path: "/product-mastery" },
  { key: "stock-ledger", label: "Stock Ledger", icon: <IconDocNav />, badge: null, path: "/stock-ledger" },
  { key: "alerts", label: "AI Alerts", icon: <IconBellNav />, badge: 3, path: "/ai-alerts" },
  { key: "customers", label: "Customer History", icon: <IconUsersNav />, badge: null, path: "/customer-history" },
];

const S = {
  sidebar: (expanded) => ({
    width: expanded ? 220 : 72, background: "#1a2e25", display: "flex", flexDirection: "column",
    alignItems: "center", padding: "20px 0", gap: 4, transition: "width 0.28s cubic-bezier(.22,.68,0,1.1)", overflow: "hidden", flexShrink: 0,
  }),
  sidebarLogo: {
    width: 40, height: 40, flexShrink: 0, background: "linear-gradient(135deg,#2a6049,#1c4232)",
    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
    fontSize: 13, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 16,
  },
  divider: (expanded) => ({
    width: expanded ? 180 : 32, height: 1, background: "rgba(255,255,255,.10)", margin: "5px 0", transition: "width 0.28s", flexShrink: 0,
  }),
  navItem: (isActive, danger, hov) => ({
    width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "10px 16px", cursor: "pointer",
    color: danger ? (hov ? "rgba(255,120,120,0.9)" : "rgba(255,130,130,0.75)") : isActive ? "#fff" : hov ? "rgba(255,255,255,.9)" : "rgba(255,255,255,0.5)",
    background: isActive ? "rgba(255,255,255,.10)" : hov ? "rgba(255,255,255,.06)" : "transparent",
    borderLeft: isActive ? "3px solid #6ee7b7" : "3px solid transparent", whiteSpace: "nowrap", transition: "color 0.18s, background 0.18s",
  }),
  navIconWrap: (isActive, hov) => ({
    width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 10, background: isActive || hov ? "rgba(255,255,255,.08)" : "transparent", transition: "background 0.18s",
  }),
  navLabel: (expanded) => ({
    fontSize: 13.5, fontWeight: 500, opacity: expanded ? 1 : 0, transform: expanded ? "translateX(0)" : "translateX(-8px)", transition: "opacity 0.22s 0.04s, transform 0.22s 0.04s", flex: 1,
  }),
  navBadge: (expanded) => ({
    background: "#e05c5c", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100, flexShrink: 0, opacity: expanded ? 1 : 0, transition: "opacity 0.22s",
  }),
};

function NavItem({ item, isActive, expanded, onClick, danger = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={S.navItem(isActive, danger, hov)}>
      <div style={S.navIconWrap(isActive, hov)}>{item.icon}</div>
      <span style={S.navLabel(expanded)}>{item.label}</span>
      {item.badge && <span style={S.navBadge(expanded)}>{item.badge}</span>}
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const handleNavClick = (item) => {
    if (item.key === "ai") return; // stay here
    window.location.href = "http://localhost:5175" + item.path;
  };

  return (
    <nav style={S.sidebar(expanded)} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)}>
      <div style={S.sidebarLogo}>Rx</div>
      {NAV.map((item, i) =>
        item === null ? <div key={`div-${i}`} style={S.divider(expanded)} /> :
          <NavItem key={item.key} item={item} isActive={item.key === "ai"} expanded={expanded} onClick={() => handleNavClick(item)} />
      )}
      <div style={{ marginTop: "auto", width: "100%" }}>
        <div style={S.divider(expanded)} />
        <NavItem item={{ key: "logout", label: "Logout", icon: <IconLogoutNav />, badge: null }} isActive={false} expanded={expanded} onClick={() => { }} danger />
      </div>
    </nav>
  );
}

// ─── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState('assistant');
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');

  useEffect(() => {
    axios.get(`${API}/health`)
      .then(r => setOllamaStatus(r.data.ollama))
      .catch(() => setOllamaStatus({ ok: false, error: 'Backend not running' }));
  }, []);

  const [registeredPatient, setRegisteredPatient] = useState(null);
  const handleNavigateToRegister = (name) => { setNewPatientName(name); setShowRegister(true); };
  const handlePatientCreated = (patient) => { setRegisteredPatient(patient); setShowRegister(false); setActivePage('assistant'); };

  const pageTitle = { assistant: 'AI Voice & Text Assistant', dashboard: 'Dashboard', inventory: 'Inventory', customers: 'Customers', reports: 'Purchase History' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={activePage} onNavigate={(p) => { setShowRegister(false); setActivePage(p); }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e4ece7', background: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{showRegister ? 'New Patient Registration' : pageTitle[activePage]}</h2>
            {activePage === 'assistant' && !showRegister && <p style={{ margin: 0, color: '#7a9688', fontSize: 12, marginTop: 2 }}>Automate prescription extraction and inventory checks using Ollama AI (free, local).</p>}
            {showRegister && <p style={{ margin: 0, color: '#7a9688', fontSize: 12, marginTop: 2 }}>Register new patient → auto-redirects back to assistant in 3s</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {ollamaStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ollamaStatus.ok ? '#2a6049' : '#e05c5c', background: ollamaStatus.ok ? '#eaf2ed' : '#fdf0f0', padding: '4px 10px', borderRadius: 20, border: `1px solid ${ollamaStatus.ok ? '#c8ddd1' : '#f5c4c4'}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: ollamaStatus.ok ? '#2a6049' : '#e05c5c' }} />
                {ollamaStatus.ok ? 'Ollama Online' : 'Ollama Offline'}
              </div>
            )}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a9688' }}><Icon.Bell /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2a6049, #1c4232)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
              <div><div style={{ fontWeight: 600, fontSize: 13 }}>Admin</div><div style={{ color: '#7a9688', fontSize: 11 }}>Pharmacist</div></div>
            </div>
          </div>
        </div>
        <OllamaStatusBanner status={ollamaStatus} />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {showRegister ? (
            <NewPatientPage detectedName={newPatientName} onPatientCreated={handlePatientCreated} onSkip={() => { setShowRegister(false); setActivePage('assistant'); }} />
          ) : activePage === 'assistant' ? (
            <AssistantPage ollamaStatus={ollamaStatus} onNavigateToRegister={handleNavigateToRegister} registeredPatient={registeredPatient} onRegisteredPatientUsed={() => setRegisteredPatient(null)} />
          ) : activePage === 'dashboard' ? <DashboardPage onNavigate={(p) => { setShowRegister(false); setActivePage(p); }} />
            : activePage === 'inventory' ? <InventoryPage />
              : activePage === 'customers' ? <CustomersPage />
                : <HistoryPage />}
        </div>
      </div>
    </div>
  );
}
