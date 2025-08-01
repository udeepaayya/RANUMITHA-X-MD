const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["hyranu", "ranu", "status", "a"],
    react: "⚡",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, {
    from, quoted, reply, sender
}) => {
    try {
        await robin.sendPresenceUpdate('recording', from);

        // Voice Note
        await robin.sendMessage(from, {
            audio: {
                url: "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/Amor%20Na%20Praia%20(Slowed)%20edited.mp3"
            },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });

        // Stylish Alive Caption
        const status = `
╭─〔 *💠 WHITESHADOW-MD IS ONLINE 💠* 〕─◉
│
│📌 *Bot Status:* ✅ Active & Working!
│👤 *Owner:* Hiruka Ranumitha
│🌀 *Version:* 4.0.0
│🔧 *Prefix:* [ . ]
│🛠 *Mode:* [ Public ]
│💻 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥 *Host:* ${os.hostname()}
│⏳ *Uptime:* ${runtime(process.uptime())}
│📬 *Newsletter:* 👾 ᏔᎻᎥᏆᎬՏᎻᎪᎠᎾᏇ ᎷᎠ 👾
╰─────────────────────────────⊷`;

        // Send Image + Caption
        await robin.sendMessage(from, {
            image: {
                url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_20250726_193256660.jpg" // You can replace this with your own ALIVE_IMG URL
        }, { quoted: mek });

    } catch (e) {
        console.log("Alive Error:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
