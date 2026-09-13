# 🤖 GeminiAI WhatsApp Bot

An AI-powered automation assistant built for WhatsApp. This bot is specifically designed for individuals and merchants using **WhatsApp Business**, providing a seamless bridge to advanced conversational AI where native Meta AI integrations are currently restricted or unavailable.

> ⚠️ **IMPORTANT NOTICE:** This repository is intended strictly for personal deployment and targeted use. It is not designed as an out-of-the-box public SaaS application. If you choose to adopt this project, you **must modify the configurations, API bindings, and environment handles yourself** to link your unique credentials.

---

## ✨ Features

- 💼 **WhatsApp Business Optimization:** Tailored to bypass platform-level limitations, enabling automation workflows directly inside business chats.
- 🧠 **Gemini AI Core:** Powered by Google's Gemini API (`gemini.js`) to provide intelligent, human-like answers, context recognition, and accurate client handling.
- 🧩 **Modular JavaScript Engine:** Built cleanly across a segmented architecture separating execution orchestration (`main.js`) from dedicated client session handling (`whatsapp.js`).

---

## 📋 Technology Stack & Infrastructure

- **Runtime Environment:** Node.js (v18+ recommended)
- **Primary Libraries:** WhatsApp Web automation frameworks and the official Google Gen AI SDK.
- **Local Data Caching:** File-system persistence handles active user profiles and contextual prompts via the `./data/` matrix directory.

---

## 🚀 Installation & Local Launch

1. **Clone the Project Repository**:
   ```bash
   git clone https://github.com
   cd GeminiAI_Whatsapp_Bot
   ```

2. **Install Core Network Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Settings**:
   Open up `gemini.js` and `whatsapp.js` to establish your explicit server ports, Google API authorization keys, and WhatsApp routing sessions.

4. **Initialize Execution Loop**:
   ```bash
   node main.js
   ```
   *Scan the generated terminal QR code with your target WhatsApp Business account to establish the background socket layer.*

---

## 📄 License

Distributed under the conditions of the **MIT License**. See the `LICENSE` file for more details.
