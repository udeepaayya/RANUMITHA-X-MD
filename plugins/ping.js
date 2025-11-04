const config = require('../config');
const { cmd, commands } = require('../command');

// ==================== PING (Edit Version - Fast) ====================
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
        const startTime = Date.now();

        const emojis = ['💀', '⚡'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React with random emoji
        await conn.sendMessage(from, {
            react: { text: randomEmoji, key: mek.key }
        });

        // First send: "ping ! ! !"
        let sentMsg = await conn.sendMessage(from, { text: "ping ! ! !" }, { quoted: mek });

        // Calculate ping
        const ping = Date.now() - startTime;

        // Edit same message with ping result
        const newText = `*Ping: _${ping}ms_ ${randomEmoji}*`;

        await conn.sendMessage(from, {
            edit: sentMsg.key,
            text: newText,
        });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


// ==================== PING2 (Final Result Only - No Edit, No Measuring Msg) ====================

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
    desc: "Check bot's response time (simple and accurate).",
    category: "main",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const emojis = ['🔥', '⚡', '🚀', '💫'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Start timer before sending
        const start = Date.now();

        // React
        conn.sendMessage(from, { react: { text: randomEmoji, key: mek.key } }).catch(() => {});

        // Calculate ping
        const ping = Date.now() - start;

        // Define status
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 150) { badge = '🚀 Super Fast'; color = '🟢'; }
        else if (ping <= 300) { badge = '⚡ Fast'; color = '🟡'; }
        else if (ping <= 600) { badge = '⚠️ Medium'; color = '🟠'; }

        // Send final ping result only
        const text = `*RANUMITHA-X-MD Ping:* ${ping} ms ${randomEmoji}\n> *Status:* ${color} ${badge}\n> *Version:* ${config.BOT_VERSION}`;
        await conn.sendMessage(from, { text }, { quoted: fakevCard });

    } catch (e) {
        console.error("❌ Error in ping2 command:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
