const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const os = require("os")

// Fake vCard
const fakevCard = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};

// Helper function for boolean
function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

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

        // Settings menu text
        const info = `╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』───❏
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

        const image = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/Config%20img%20.jpg";
        const audioUrl = "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/envlist-music.mp3";

        // Send menu with image
        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: fakevCard });
        const messageID = sentMsg.key.id;

        // Send audio (voice note style)
        await conn.sendMessage(from, { audio: { url: audioUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: mek });

        // Listen for replies
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const mekInfo = msgUpdate?.messages[0];
            if (!mekInfo?.message) return;

            const fromUser = mekInfo.key.remoteJid;
            const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const quotedId = mekInfo.message?.extendedTextMessage?.contextInfo?.stanzaId;

            if (quotedId !== messageID) return; // only handle replies to this menu

            const userReply = textMsg?.trim();

            // Valid replies 1.1–20.2
            if (/^(1\.1|1\.2|1\.3|1\.4|2\.1|2\.2|3\.1|3\.2|4\.1|4\.2|5\.1|5\.2|6\.1|6\.2|7\.1|7\.2|8\.1|8\.2|9\.1|9\.2|10\.1|10\.2|11\.1|11\.2|12\.1|12\.2|13\.1|13\.2|14\.1|14\.2|15\.1|15\.2|16\.1|16\.2|17\.1|17\.2|18\.1|18\.2|19\.1|19\.2|20\.1|20\.2)$/.test(userReply)) {
                await conn.sendMessage(fromUser, { react: { text: '✅', key: mekInfo.key } });

                const commandMap = {
                    "1.1": ".mode public",
                    "1.2": ".mode private",
                    "1.3": ".mode group",
                    "1.4": ".mode inbox",
                    "2.1": ".auto-recording on",
                    "2.2": ".auto-recording off",
                    "3.1": ".auto-typing on",
                    "3.2": ".auto-typing off",
                    "4.1": ".always-online on",
                    "4.2": ".always-online off",
                    "5.1": ".public-mod on",
                    "5.2": ".public-mod off",
                    "6.1": ".auto-voice on",
                    "6.2": ".auto-voice off",
                    "7.1": ".auto-sticker on",
                    "7.2": ".auto-sticker off",
                    "8.1": ".auto-reply on",
                    "8.2": ".auto-reply off",
                    "9.1": ".auto-react on",
                    "9.2": ".auto-react off",
                    "10.1": ".auto-seen on",
                    "10.2": ".auto-seen off",
                    "11.1": ".status-reply on",
                    "11.2": ".status-reply off",
                    "12.1": ".status-react on",
                    "12.2": ".status-react off",
                    "13.1": ".customreact on",
                    "13.2": ".customreact off",
                    "14.1": ".anti-vv on",
                    "14.2": ".anti-vv off",
                    "15.1": ".welcome on",
                    "15.2": ".welcome off",
                    "16.1": ".antilink on",
                    "16.2": ".antilink off",
                    "17.1": ".read-message on",
                    "17.2": ".read-message off",
                    "18.1": ".anti-bad on",
                    "18.2": ".anti-bad off",
                    "19.1": ".antilinkkick on",
                    "19.2": ".antilinkkick off",
                    "20.1": ".read-cmd on",
                    "20.2": ".read-cmd off",
                };

                const cmdToSend = commandMap[userReply];
                await conn.sendMessage(fromUser, { text: `${cmdToSend}` }, { quoted: mekInfo });

            } else {
                await conn.sendMessage(fromUser, { text: "❌ Invalid choice! Reply with 1.1–20.2" }, { quoted: mekInfo });
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ Main error: ${error.message || "Error!"}`);
    }
});
