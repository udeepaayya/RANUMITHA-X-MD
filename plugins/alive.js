const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["hyranu", "ranu", "status", "a"],
    react: "⚡",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isOwner, groupMetadata, groupName,
    participants, groupAdmins, isBotAdmins, isAdmins, reply
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
╭─〔 *💠 ${config.BOT_NAME} IS ONLINE 💠* 〕─◉
│
│📌 *Bot Status:* ✅ Active & Working!
│👤 *Owner:* ${config.OWNER_NAME}
│🌀 *Version:* 4.0.0
│🔧 *Prefix:* [ ${config.PREFIX} ]
│🛠 *Mode:* [ ${config.MODE} ]
│💻 *RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖥 *Host:* ${os.hostname()}
│⏳ *Uptime:* ${runtime(process.uptime())}
│📬 *Newsletter:* 👾 RANUMITHA X ᎷᎠ 👾
╰─────────────────────────────⊷`;

        // Send Image + Caption
        await robin.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401868132010@newsletter',
                    newsletterName: '👾RANUMITHA X ᎷᎠ👾',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log("Alive Error:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
