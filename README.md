# 🤖 HackFusionRx AI Assistant

The AI Assistant is the **core intelligence layer** of HackFusionRx, responsible for converting prescriptions into structured, bill-ready data.

It supports **voice, text, and handwritten prescription inputs**.

---

## 🚀 Features

### 🗣️ Voice & Text Input

* Accepts spoken or typed prescriptions
* Converts to structured JSON using LLM

---

### 🧾 Prescription Parsing

* Extracts:

  * Patient name
  * Medicine name
  * Dosage
  * Frequency
  * Quantity

---

### ✍️ Handwritten OCR

* Upload prescription image
* Uses Claude Vision for text extraction
* Passes result to LLM pipeline

---

### 🧠 Smart Matching

* Fuzzy matching for:

  * Customers
  * Medicines
* Handles variations like:

  * "Paracetamol" vs "Paracetamol 500mg"

---

### 💳 Bill Generation

* Auto-generates bill UI
* Shows:

  * Stock availability
  * Pricing
  * Shortages

---

### 📦 Order Processing

* Creates order in Firestore
* Creates transaction in RTDB
* Updates stock automatically
* Updates customer stats

---

### 📧 Email Integration

* Sends styled HTML bill
* Uses Gmail SMTP via Nodemailer

---

## 🧠 AI Pipeline

```
Input (Voice/Text/Image)
        ↓
Claude Vision (OCR)
        ↓
Ollama (LLaMA 3.2)
        ↓
Structured JSON
        ↓
Database Matching
        ↓
Bill Generation
```

---

## 🏗️ Tech Stack

* React (Vite)
* Node.js + Express
* Ollama (LLaMA 3.2)
* Claude Vision API
* Firebase (Firestore + RTDB)

---

## ⚙️ API Endpoints

* `/api/extract-prescription` → LLM parsing
* `/api/ocr-prescription` → OCR processing
* `/api/create-order` → Save order
* `/api/send-bill` → Email bill

---

## 🛠️ Setup Instructions

### 1. Install dependencies

```bash
npm install
```

---

### 2. Run AI Assistant

```bash
npm run dev
```

Runs on: `http://localhost:5173`

---

## ⚠️ IMPORTANT

👉 The AI Assistant will NOT function independently.

You MUST run:

* Backend (port 3001)
* Main frontend (port 5174)
* AI Assistant (port 5173)

👉 All three services must run simultaneously.

---

## 🔑 Requirements

* Ollama running locally
* Claude API key configured
* Firebase setup completed

---

## 🌟 Key Highlights

* End-to-end prescription automation
* OCR + LLM hybrid pipeline
* Real-time stock-aware billing
* Minimal manual input required

---

## 📌 Future Enhancements

* Multi-language prescription support
* Drug interaction warnings
* Voice-to-bill fully automated flow

---


