const { cmd, commands } = require('../command');
const config = require('../config');
const fs = require('fs');
const { getAnti, setAnti } = require('../data/antidel');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');

// image & audio
const image = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/Config%20img%20.jpg";
const audioUrl = "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/env%20new%20typ.opus";

function isEnabled(value) {
    return value === "true" || value === true;
}

function saveConfig() {
    fs.writeFileSync("./config.js", `module.exports = ${JSON.stringify(config, null, 4)};`);
}

const fakevCard = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
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
    pattern: "settings",
    alias: ["env", "config", "setting"],
    desc: "Interactive bot settings menu (Owner Only)",
    category: "system",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        if (!isOwner) return reply("🚫 *Owner Only Command!*");

        const info = `╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』───❏
│
├─❏ *🔖 BOT INFO*
├─∘ *Name:* RANUMITHA-X-MD
├─∘ *Prefix:* ${config.PREFIX}
├─∘ *Owner:* ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴᴬ
├─∘ *Number:* ${config.OWNER_NUMBER}
└─∘ *Version:* ${config.BOT_VERSION}
    
      ╭─ 🛡️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 🛡️ ─╮
│
│ 1.1  Public  
│ 1.2  Private 
│ 1.3  Group   
│ 1.4  Inbox
│
│ 14.1  Anti Delete ON
│ 14.2  Anti Delete OFF
│
╰──────────────────❏

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: fakevCard });
        await conn.sendMessage(from, { audio: { url: audioUrl }, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: mek });

        const menuId = sentMsg.key.id;

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const mekInfo = msgUpdate?.messages[0];
            if (!mekInfo?.message) return;
            const fromUser = mekInfo.key.remoteJid;
            const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const quotedId = mekInfo.message?.extendedTextMessage?.contextInfo?.stanzaId;
            if (quotedId !== menuId) return;
            if (!isOwner) return conn.sendMessage(fromUser, { text: "🚫 *Owner Only!*" }, { quoted: mekInfo });

            const userInput = textMsg?.trim();

            // Mode Control
            const modeMap = {
                "1.1": "public",
                "1.2": "private",
                "1.3": "group",
                "1.4": "inbox"
            };

            if (modeMap[userInput]) {
                const newMode = modeMap[userInput];
                if (config.MODE === newMode) {
                    return conn.sendMessage(fromUser, { text: `⚠️ Bot mode is already set to ${newMode.toUpperCase()}` }, { quoted: mekInfo });
                }
                config.MODE = newMode;
                saveConfig();
                return conn.sendMessage(fromUser, { text: `✔️ Bot mode is now set to ${newMode.toUpperCase()}` }, { quoted: mekInfo });
            }

            // Anti Delete (Connected to DB)
            if (userInput === "14.1") {
                await setAnti(true);
                return conn.sendMessage(fromUser, { text: "✅ Anti-delete has been enabled" }, { quoted: mekInfo });
            }

            if (userInput === "14.2") {
                await setAnti(false);
                return conn.sendMessage(fromUser, { text: "❌ Anti-delete has been disabled" }, { quoted: mekInfo });
            }

            // Default response
            return conn.sendMessage(fromUser, { text: "❌ Invalid option!" }, { quoted: mekInfo });
        });

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message || "Something went wrong!"}`);
    }
});
