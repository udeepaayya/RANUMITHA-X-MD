const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const os = require("os")

// Helper function to check boolean envs
function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

// Fake ChatGPT vCard
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
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};

cmd({
    pattern: "env",
    alias: ["config", "settings", "setting"],
    desc: "Show all bot configuration variables (Owner Only)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply, isOwner }) => {
    try {
        // --- Owner check ---
        if (!isOwner) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("🚫 *Owner Only Command!*");
        }

        // --- Menu text ---
        let envSettings = `╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』───❏
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

        // Send menu image
        await conn.sendMessage(from, {
            image: { url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/Config%20img%20.jpg" },
            caption: envSettings
        }, { quoted: fakevCard });

        // Send menu audio
        await conn.sendMessage(from, {
            audio: { url: "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/envlist-music.mp3" },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: mek });

        // --- Number reply handler ---
        const handler = async (msgUpdate) => {
            try {
                const msg = msgUpdate.messages[0];
                if (!msg.message) return;

                let text = msg.message.conversation || msg.message.extendedTextMessage?.text;
                if (!text) return;
                text = text.trim();

                const sender = msg.key.participant || msg.key.remoteJid;

                // Only owner can reply numbers
                if (sender !== mek.key.remoteJid) return;

                // ✅ react first for valid number
                if (/^(1.1,1.2,1.3,1.4,2.1,2.2,3.1,3.2,4.1,4.2,5.1,5.2,6.1,6.2,7.1,7.2,8.1,8.2,9.1,9.2,10.1,10.2,11.1,11.2,12.1,12.2,13.1,13.2,14.1,14.2,15.1,15.2,16.1,16.2,17.1,17.2,18.1,18.2,19.1,19.2,20.1,20.2)$/.test(text)) {
                    await conn.sendMessage(sender, { react: { text: "✅", key: msg.key } });
                }

                // --- Send corresponding answer ---
                switch (text) {
                    case '1.1': await reply(".mode public"); break;
                    case '1.2': await reply(".mode private"); break;
                    case '1.3': await reply(".mode group"); break;
                    case '1.4': await reply(".mode inbox"); break;
                    case '2.1': await reply(".auto-recording on"); break;
                    case '2.2': await reply(".auto-recording off"); break;
                    case '3.1': await reply(".auto-typing on"); break;
                    case '3.2': await reply(".auto-typing off"); break;
                    case '4.1': await reply(".always-online on"); break;
                    case '4.2': await reply(".always-online off"); break;
                    case '5.1': await reply(".public-mod on"); break;
                    case '5.2': await reply(".public-mod off"); break;
                    case '6.1': await reply(".auto-voice on"); break;
                    case '6.2': await reply(".auto-voice off"); break;
                    case '7.1': await reply(".auto-sticker on"); break;
                    case '7.2': await reply(".auto-sticker off"); break;
                    case '8.1': await reply(".auto-reply on"); break;
                    case '8.2': await reply(".auto-reply off"); break;
                    case '9.1': await reply(".auto-react on"); break;
                    case '9.2': await reply(".auto-react off"); break;
                    case '10.1': await reply(".auto-seen on"); break;
                    case '10.2': await reply(".auto-seen off"); break;
                    case '11.1': await reply(".status-reply on"); break;
                    case '11.2': await reply(".status-reply off"); break;
                    case '12.1': await reply(".status-react on"); break;
                    case '12.2': await reply(".status-react off"); break;
                    case '13.1': await reply(".customreact on"); break;
                    case '13.2': await reply(".customreact off"); break;
                    case '14.1': await reply(".anti-vv on"); break;
                    case '14.2': await reply(".anti-vv off"); break;
                    case '15.1': await reply(".welcome on"); break;
                    case '15.2': await reply(".welcome off"); break;
                    case '16.1': await reply(".antilink on"); break;
                    case '16.2': await reply(".antilink off"); break;
                    case '17.1': await reply(".read-message on"); break;
                    case '17.2': await reply(".read-message off"); break;
                    case '18.1': await reply(".anti-bad on"); break;
                    case '18.2': await reply(".anti-bad off"); break;
                    case '19.1': await reply(".antilinkkick on"); break;
                    case '19.2': await reply(".antilinkkick off"); break;
                    case '20.1': await reply(".read-cmd on"); break;
                    case '20.2': await reply(".read-cmd off"); break;
                    case 'exit':
                        await reply("✅ Settings menu closed.");
                        conn.ev.off('messages.upsert', handler);
                        return;
                    default:
                        if (/^(1.1,1.2,1.3,1.4,2.1,2.2,3.1,3.2,4.1,4.2,5.1,5.2,6.1,6.2,7.1,7.2,8.1,8.2,9.1,9.2,10.1,10.2,11.1,11.2,12.1,12.2,13.1,13.2,14.1,14.2,15.1,15.2,16.1,16.2,17.1,17.2,18.1,18.2,19.1,19.2,20.1,20.2)$/.test(text)) {
                            await reply("❌ Invalid option, please select correctly.");
                        }
                }

            } catch (err) {
                console.error("Handler error:", err);
            }
        };

        // Listen to message updates
        conn.ev.on('messages.upsert', handler);

    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error: ${error.message}`);
    }
});
