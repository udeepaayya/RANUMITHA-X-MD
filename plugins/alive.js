const { cmd } = require('../command');
const config = require('../config');
const os = require("os");
const { runtime } = require('../lib/functions');

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
    pattern: "alive",
    alias: ["hyranu", "ranu", "status"],
    react: "🌝",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, quoted, reply, sender }) => {
    try {
        await robin.sendPresenceUpdate('recording', from);

        // Voice Note
        await robin.sendMessage(from, {
            audio: {
                url: "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/Ranumitha-x-md-Alive-org.opus"
            },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: fakevCard });

        // Stylish Alive Caption
        const status = `
👋 Hello, I am alive now !!

╭─〔 💠 ALIVE STATUS 💠 〕─◉
│
│🐼 *Bot*: 𝐑𝐀𝐍𝐔𝐌𝐈𝐓𝐇𝐀-𝐗-𝐌𝐃
│🤵‍♂ *Owner*: ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴᴬ
│⏰ *Uptime*: ${runtime(process.uptime())}
│⏳ *Ram*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
│🖊 *Prefix*: [ ${config.PREFIX} ]
│🛠 *Mode*: [ ${config.MODE} ]
│🖥 *Host*: ${os.hostname()}
│🌀 *Version*: ${config.BOT_VERSION}
╰─────────────────────────────⊷

      1️⃣  ʙᴏᴛ ᴍᴇɴᴜ (.menu)
      2️⃣  ʙᴏᴛ ꜱᴘᴇᴇᴅ (.ping)

> 𝐌𝐚𝐝𝐞 𝐛𝐲 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔 🥶`;

        // Send Image + Caption
        const sent = await robin.sendMessage(from, {
            image: { url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_20250726_193256660.jpg" },
            caption: status,
            contextInfo: { mentionedJid: [sender] }
        }, { quoted: mek });

        // Wait for reply to that message
        robin.ev.on('messages.upsert', async (msgUpdate) => {
            const msg = msgUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // check reply is to alive message
            if (msg.message.extendedTextMessage?.contextInfo?.stanzaId !== sent.key.id) return;

            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

            if (text === '1') {
                await robin.sendMessage(from, { text: '.menu' });
            } else if (text === '2') {
                await robin.sendMessage(from, { text: '.ping' });
            }
        });

    } catch (e) {
        console.log("Alive Error:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
