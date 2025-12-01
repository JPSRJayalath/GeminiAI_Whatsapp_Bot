// whatsapp-gemini-sqlite.js
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

// ==================== CONFIG ====================
const GEMINI_API_KEY = "AIzaSyCetdoR3kbsagJB8Xpmqybo9S0lucCu3mQ";
const DB_DIR = './data';
const DB_FILE = path.join(DB_DIR, 'users.db');

// THIS IS THE REAL WORKING MODEL (December 2025)
const MODEL_NAME = "gemini-2.5-flash";  // 100% working, fast, free

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const WELCOME_MESSAGE = `You're now chatting with *Gemini*, your AI assistant.
Please note that conversations may be reviewed for safety.
Developed by *JPSR Jayalath*.`;

// Create .data folder
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// ==================== DATABASE ====================
const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
});

await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        phone TEXT PRIMARY KEY,
        first_seen INTEGER,
        last_seen INTEGER,
        welcomed INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT,
        role TEXT,
        content TEXT,
        timestamp INTEGER
    );
`);

// ==================== FORMAT FOR WHATSAPP (BOLD FIX) ====================
function toWhatsAppFormat(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '*$1*')   // **bold** → *bold*
        .replace(/__(.*?)__/g, '*$1*')       // __bold__ → *bold*
        .trim();
}

// ==================== GEMINI WITH MEMORY ====================
async function askGemini(phone, message) {
    try {
        const rows = await db.all(
            'SELECT role, content FROM history WHERE phone = ? ORDER BY timestamp DESC LIMIT 20',
            phone
        );

        const history = rows.reverse().map(r => ({
            role: r.role,
            parts: [{ text: r.content }]
        }));

        history.push({ role: "user", parts: [{ text: message }] });

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: "You are a friendly, helpful AI assistant on WhatsApp. Use **bold** for important words."
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        let reply = result.response.text();

        // FIX BOLD FOR WHATSAPP
        reply = toWhatsAppFormat(reply);

        // Save to history
        await db.run('INSERT INTO history (phone, role, content, timestamp) VALUES (?, ?, ?, ?)',
            [phone, 'user', message, Date.now()]);
        await db.run('INSERT INTO history (phone, role, content, timestamp) VALUES (?, ?, ?, ?)',
            [phone, 'model', reply, Date.now()]);

        return reply;
    } catch (err) {
        console.error("Gemini Error:", err.message);
        return "Sorry, I'm having a small issue. Try again later.";
    }
}

// ==================== WHATSAPP CLIENT ====================
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan this QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.clear();
    const count = (await db.get('SELECT COUNT(*) as c FROM users'))?.c || 0;
    console.log(`Gemini WhatsApp Bot is LIVE`);
    console.log(`Model: ${MODEL_NAME}`);
    console.log(`Total Users: ${count}\n`);
});

client.on('message', async (msg) => {
    if (msg.fromMe) return;
    if (msg.from.endsWith('@g.us')) return; // Remove for groups

    const phone = (msg.author || msg.from).split('@')[0];
    const text = msg.body?.trim();
    if (!text) return;

    const chat = await msg.getChat();
    let user = await db.get('SELECT welcomed FROM users WHERE phone = ?', phone);

    // FIRST TIME USER → Welcome once
    if (!user) {
        await db.run(
            'INSERT INTO users (phone, first_seen, last_seen, welcomed) VALUES (?, ?, ?, ?)',
            [phone, Date.now(), Date.now(), 1]
        );
        await chat.sendMessage(WELCOME_MESSAGE);
        console.log(`NEW USER: ${phone} → Welcome sent`);
    }

    // Update last seen
    await db.run('UPDATE users SET last_seen = ? WHERE phone = ?', Date.now(), phone);

    // Always reply with AI
    await chat.sendStateTyping();
    const reply = await askGemini(phone, text);
    await chat.sendMessage(reply);

    console.log(`Replied to ${phone}`);
});

client.initialize();
