const { cmd, commands } = require('../command');
const config = require('../config');
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');

// New image and audio URLs
const image = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/Config%20img%20.jpg";
const audioUrl = "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/env%20new%20typ.opus";

// helper: check if enabled
function isEnabled(value) {
    return value === "true" || value === true;
}

// helper: save config permanently
function saveConfig() {
    fs.writeFileSync("./config.js", `module.exports = ${JSON.stringify(config, null, 4)};`);
}

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
    pattern: "settings",
    alias: ["env","config","setting"],
    desc: "Interactive bot settings menu (Owner Only)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        if (!isOwner) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("🚫 *Owner Only Command!*");
        }

        const info = `╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』───❏
│ 🔖 BOT INFO╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』───❏
│
├─❏ *🔖 BOT INFO*
├─∘ *Name:* RANUMITHA-X-MD
├─∘ *Prefix:* ${config.PREFIX}
├─∘ *Owner:* ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴᴬ
├─∘ *Number:* ${config.OWNER_NUMBER}
└─∘ *Version:* ${config.BOT_VERSION}
    
      ╭─ 🛡️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 🛡️ ─╮
╭───────────────────╮
│ SELECT WORK MODE *${config.MODE.toUpperCase()}*  |
╰───────────────────╯ 
│ ┣ 1.1  Public  
│ ┣ 1.2  Private 
│ ┣ 1.3  Group   
│ ┗ 1.4  Inbox
│
╭──────────────────╮
│ Auto Recording: ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"}                 |
╰──────────────────╯ 
│ ┣ 2.1  true  ✅ 
│ ┗ 2.2  false ❌
│
╭──────────────────╮
│ Auto Typing: ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"}                        |
╰──────────────────╯ 
│ ┣ 3.1  true  ✅ 
│ ┗ 3.2  false ❌
│
╭──────────────────╮
│ Always Online: ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"}                    |
╰──────────────────╯ 
│ ┣ 4.1  true  ✅ 
│ ┗ 4.2  false ❌
│
╭──────────────────╮
│ Public Mod: ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"}                         |
╰──────────────────╯ 
│ ┣ 5.1  true  ✅ 
│ ┗ 5.2  false ❌
│
╭──────────────────╮
│ Auto Voice: ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"}                          |
╰──────────────────╯ 
│ ┣ 6.1  true  ✅ 
│ ┗ 6.2  false ❌
│
╭──────────────────╮
│ Auto Sticker: ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"}                       |
╰──────────────────╯ 
│ ┣ 7.1  true  ✅ 
│ ┗ 7.2  false ❌
│
╭──────────────────╮
│ Auto Reply: ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"}                          |
╰──────────────────╯ 
│ ┣ 8.1  true  ✅ 
│ ┗ 8.2  false ❌
│
╭──────────────────╮
│ Auto React: ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"}                         |
╰──────────────────╯ 
│ ┣ 9.1  true  ✅ 
│ ┗ 9.2  false ❌
│
╭──────────────────╮
│ Auto Status Seen: ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"}              |
╰──────────────────╯ 
│ ┣ 10.1  true  ✅ 
│ ┗ 10.2  false ❌
│
╭──────────────────╮
│ Auto Status Reply: ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"}             |
╰──────────────────╯ 
│ ┣ 11.1  true  ✅ 
│ ┗ 11.2  false ❌
│
╭──────────────────╮
│ Auto Status React: ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"}             |
╰──────────────────╯ 
│ ┣ 12.1  true  ✅ 
│ ┗ 12.2 false ❌
│
╭──────────────────╮
│ Custom React: ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"}                   |
╰──────────────────╯ 
│ ┣ 13.1  true  ✅ 
│ ┗ 13.2  false ❌
│
╭──────────────────╮
│ Anti VV: ${isEnabled(config.ANTI_VV) ? "✅" : "❌"}                                |
╰──────────────────╯ 
│ ┣ 14.1  true  ✅ 
│ ┗ 14.2  false ❌
│
╭──────────────────╮
│ Welcome: ${isEnabled(config.WELCOME) ? "✅" : "❌"}                            |
╰──────────────────╯ 
│ ┣ 15.1  true  ✅ 
│ ┗ 15.2  false ❌
│
╭──────────────────╮
│ Anti Link: ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"}                              |
╰──────────────────╯ 
│ ┣ 16.1  true  ✅ 
│ ┗ 16.2  false ❌
│
╭──────────────────╮
│ Read Message: ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"}                  |
╰──────────────────╯ 
│ ┣ 17.1  true  ✅ 
│ ┗ 17.2  false ❌
│
╭──────────────────╮
│ Anti Bad: ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"}                              |
╰──────────────────╯ 
│ ┣ 18.1  true  ✅ 
│ ┗ 18.2  false ❌
│
╭──────────────────╮
│ Anti Link Kick: ${isEnabled(config.ANTI_LINK_KICK) ? "✅" : "❌"}                     |
╰──────────────────╯ 
│ ┣ 19.1  true  ✅ 
│ ┗ 19.2  false ❌
│
╭──────────────────╮
│ Read CMD: ${isEnabled(config.READ_CMD) ? "✅" : "❌"}                          |
╰──────────────────╯ 
│ ┣ 20.1  true  ✅ 
│ ┗ 20.2  false ❌
│
│
├─❏ *🦠 STATUS*
│  ├─∘ Auto Status MSG: ${config.AUTO_STATUS_MSG}
│  ├─∘ Custom React Emojis: ${config.CUSTOM_REACT_EMOJIS}
│  ├─∘ Anti-Del Path: ${config.ANTI_DEL_PATH}
│  └─∘ Dev Number: ${config.DEV}
│
╰──────────────────❏

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        // Send image with caption + audio (PTT)
        const sentMsg = await conn.sendMessage(from, {
            image: { url: image },
            caption: info
        }, { quoted: fakevCard });

        // send audio separately after menu
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: mek });

        const menuId = sentMsg.key.id;

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const mekInfo = msgUpdate?.messages[0];
            if (!mekInfo?.message) return;
            const fromUser = mekInfo.key.remoteJid;
            const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const quotedId = mekInfo.message?.extendedTextMessage?.contextInfo?.stanzaId;
            if (quotedId !== menuId) return;

            if (!isOwner) {
                await conn.sendMessage(fromUser, { text: "🚫 *Owner Only!*" }, { quoted: mekInfo });
                await conn.sendMessage(fromUser, { react: { text: "❌", key: mekInfo.key } });
                return;
            }

            const commandMap = {
                "2.1": { key: "AUTO_RECORDING", toggle: true },
                "2.2": { key: "AUTO_RECORDING", toggle: false },
                "3.1": { key: "AUTO_TYPING", toggle: true },
                "3.2": { key: "AUTO_TYPING", toggle: false },
                "4.1": { key: "ALWAYS_ONLINE", toggle: true },
                "4.2": { key: "ALWAYS_ONLINE", toggle: false },
                "5.1": { key: "PUBLIC_MODE", toggle: true },
                "5.2": { key: "PUBLIC_MODE", toggle: false },
                "6.1": { key: "AUTO_VOICE", toggle: true },
                "6.2": { key: "AUTO_VOICE", toggle: false },
                "7.1": { key: "AUTO_STICKER", toggle: true },
                "7.2": { key: "AUTO_STICKER", toggle: false },
                "8.1": { key: "AUTO_REPLY", toggle: true },
                "8.2": { key: "AUTO_REPLY", toggle: false },
                "9.1": { key: "AUTO_REACT", toggle: true },
                "9.2": { key: "AUTO_REACT", toggle: false },
                "10.1": { key: "AUTO_STATUS_SEEN", toggle: true },
                "10.2": { key: "AUTO_STATUS_SEEN", toggle: false },
                "11.1": { key: "AUTO_STATUS_REPLY", toggle: true },
                "11.2": { key: "AUTO_STATUS_REPLY", toggle: false },
                "12.1": { key: "AUTO_STATUS_REACT", toggle: true },
                "12.2": { key: "AUTO_STATUS_REACT", toggle: false },
                "13.1": { key: "CUSTOM_REACT", toggle: true },
                "13.2": { key: "CUSTOM_REACT", toggle: false },
                "14.1": { key: "ANTI_VV", toggle: true },
                "14.2": { key: "ANTI_VV", toggle: false },
                "15.1": { key: "WELCOME", toggle: true },
                "15.2": { key: "WELCOME", toggle: false },
                "16.1": { key: "ANTI_LINK", toggle: true },
                "16.2": { key: "ANTI_LINK", toggle: false },
                "17.1": { key: "READ_MESSAGE", toggle: true },
                "17.2": { key: "READ_MESSAGE", toggle: false },
                "18.1": { key: "ANTI_BAD", toggle: true },
                "18.2": { key: "ANTI_BAD", toggle: false },
                "19.1": { key: "ANTI_LINK_KICK", toggle: true },
                "19.2": { key: "ANTI_LINK_KICK", toggle: false },
                "20.1": { key: "READ_CMD", toggle: true },
                "20.2": { key: "READ_CMD", toggle: false }
            };

            const selected = commandMap[textMsg?.trim()];
            if (!selected)
                return await conn.sendMessage(fromUser, { text: "❌ Invalid choice! Reply with number from menu." }, { quoted: mekInfo });

            const { key, toggle } = selected;
            const currentValue = isEnabled(config[key]);

            if (currentValue === toggle) {
                await conn.sendMessage(fromUser, { text: `⚠️ *${key.replace(/_/g," ")} is already ${toggle ? "ON ✅" : "OFF ❌"}*` }, { quoted: mekInfo });
                await conn.sendMessage(fromUser, { react: { text: toggle ? "✅" : "❌", key: mekInfo.key } });
                return;
            }

            config[key] = toggle ? "true" : "false";
            saveConfig();

            await conn.sendMessage(fromUser, { text: `✅ *${key.replace(/_/g," ")} is now ${toggle ? "ON" : "OFF"}*` }, { quoted: mekInfo });
            await conn.sendMessage(fromUser, { react: { text: toggle ? "✅" : "❌", key: mekInfo.key } });
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ Error: ${error.message || "Something went wrong!"}`);
    }
});
