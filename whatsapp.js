// // whatsapp.js
// import pkg from 'whatsapp-web.js';
// const { Client, LocalAuth } = pkg;
// import qrcode from 'qrcode-terminal';

// const client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//         executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     }
// });

// client.on('qr', (qr) => {
//     console.log('Scan QR with WhatsApp:');
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.clear();
//     console.log('WhatsApp Bot is ONLINE & Auto-Replies Active\n');
// });

// client.on('message', async (msg) => {
//     if (msg.fromMe) return;
//     if (msg.from.endsWith('@g.us')) return;  // Remove for group support

//     const timestamp = new Date().toLocaleString();

//     // Extract REAL phone number
//     let realPhone = msg.author || msg.from;
//     realPhone = realPhone.split('@')[0];
//     if (realPhone.includes(':')) realPhone = realPhone.split(':')[0];

//     let displayName = "Unknown";
//     try {
//         const contact = await msg.getContact();
//         displayName = contact.pushname || contact.name || realPhone;
//     } catch (e) {
//         displayName = realPhone;
//     }

//     // Show incoming message
//     console.log(`[${timestamp}]`);
//     console.log(`Phone: ${realPhone}`);
//     console.log(`Name : ${displayName === realPhone ? 'Not saved (Unknown)' : displayName}`);
//     console.log(`Msg  : ${msg.body || '(media/file)'}`);
//     console.log('───────────────────────────────────────────────\n');

//     // FIXED AUTO-REPLY: Use msg.reply() first (handles LID/Business better)
//     const replyText = `Hello! I received your message: "${msg.body || '(media)'}"\n\nThis is an auto-reply from my bot.`;
//     const replyTo = `${realPhone}@c.us`;

//     try {
//         // Try native reply (best for LID errors)
//         await msg.reply(replyText);
//         console.log(`✅ Auto-replied to ${realPhone} using native reply\n`);
//     } catch (replyErr) {
//         console.log(`❌ Native reply failed: ${replyErr.message}`);
//         try {
//             // Fallback: Force sendMessage
//             await client.sendMessage(replyTo, replyText);
//             console.log(`✅ Fallback reply sent to ${realPhone}\n`);
//         } catch (sendErr) {
//             console.log(`❌ Fallback failed: ${sendErr.message}\n`);
//             console.log('💡 Tip: This is likely a Business/LID sender. Manual reply in WhatsApp app, then try again.\n');
//         }
//     }
// });

// client.initialize();





// whatsapp.js
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.clear();
    console.log('WhatsApp Bot ONLINE – Auto-reply active (no msg.reply used)\n');
});

client.on('message', async (msg) => {
    if (msg.fromMe) return;
    if (msg.from.endsWith('@g.us')) return; // remove if you want groups

    const timestamp = new Date().toLocaleString();

    // Extract clean phone number
    let phone = (msg.author || msg.from).split('@')[0];
    if (phone.includes(':')) phone = phone.split(':')[0];

    let name = phone;
    try {
        const contact = await msg.getContact();
        name = contact.pushname || contact.name || phone;
    } catch (e) { /* ignore */ }

    console.log(`[${timestamp}]`);
    console.log(`Phone: ${phone}`);
    console.log(`Name : ${name === phone ? 'Not saved' : name}`);
    console.log(`Msg  : ${msg.body || '(media)'}`);
    console.log('───────────────────────────────────────────────\n');

    // THE FIX: Use Chat object instead of direct sendMessage()
    try {
        const chat = await msg.getChat();           // This forces WhatsApp to register the chat + LID
        await chat.sendMessage(`Hello! I got your message:\n"${msg.body || '(media)'}"\n\nAuto-reply from bot 🤖`);
        
        console.log(`Replied successfully to ${phone}\n`);
    } catch (err) {
        console.log(`Still failed for ${phone}: ${err.message}\n`);
    }
});

client.initialize();