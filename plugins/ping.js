const config = require('../config');
const { cmd, commands } = require('../command');

// ==================== PING 1 ====================
cmd({
    pattern: "ping",
    alias: ["speed", "pong", "ranuspeed", "ranuping", "ranumithaspeed"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = performance.now();

        const emojis = ['💀', '⚡'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React fast (non-blocking)
        conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        }).catch(() => {});

        // Send first message
        const sentMsg = await conn.sendMessage(from, { text: "ping ! ! !" }, { quoted: mek });

        // Calculate ping
        const ping = Math.round(performance.now() - startTime);

        // Edit same message with result
        const newText = `*Ping: _${ping}ms_ ${randomEmoji}*`;

        await conn.sendMessage(from, {
            edit: sentMsg.key,
            text: newText
        }).catch(() => {});

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


// ==================== PING 2 ====================

// Fake vCard
const fakevCard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

cmd({
    pattern: "ping2",
    alias: ["speed2", "pong2", "ranuspeed2", "ranumithaspeed2"],
    use: '.ping2',
    desc: "Check bot's response time (no edit).",
    category: "main",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const startTime = performance.now();

        const emojis = ['🔥', '⚡', '🚀', '🕐'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React quickly
        conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        }).catch(() => {});

        // Calculate ping
        const ping = Math.round(performance.now() - startTime);

        // Speed levels
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) { badge = '🚀 Super Fast'; color = '🟢'; }
        else if (ping <= 300) { badge = '⚡ Fast'; color = '🟡'; }
        else if (ping <= 600) { badge = '⚠️ Medium'; color = '🟠'; }

        // Final text message
        const text = `*RANUMITHA-X-MD Ping: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs:* ${color} ${badge}\n> *ᴠᴇʀsɪᴏɴ:* ${config.BOT_VERSION}`;

        // Send as a new message (no edit)
        await conn.sendMessage(from, { text }, { quoted: fakevCard });

    } catch (e) {
        console.error("❌ Error in ping2 command:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
