const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const os = require("os")

// Helper function to check boolean envs
function isEnabled(value) {
    return value && value.toString().toLowerCase() === "true";
}

cmd({
    pattern: "env",
    alias: ["config", "settings", "setting"],
    desc: "Show all bot configuration variables (Owner Only)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply, isOwner }) => {
    try {
    
    // Owner check
        if (!isOwner) {
            return reply("🚫 *Owner Only Command!*");
        }

        // Menu text
        let envSettings = `╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』───❏
├─ Name: RANUMITHA-X-MD
├─ Prefix: ${config.PREFIX}
├─ Owner: ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴᴬ
├─ Version: ${config.BOT_VERSION}
└─ Mode: ${config.MODE.toUpperCase()}

> Reply with numbers (e.g. 1.1 / 2.1) or type 'exit' to close.`;

        // Send menu image
        const menuMsg = await conn.sendMessage(from, {
            image: { url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/Config%20img%20.jpg" },
            caption: envSettings
        }, { quoted: mek });

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

                // Support conversation + extendedTextMessage
                let text = msg.message.conversation
                         || msg.message.extendedTextMessage?.text;
                if (!text) return;
                text = text.trim();

                const sender = msg.key.participant || msg.key.remoteJid;

            
                // ✅ react for valid number
                if (/^(\d{1.1,1.2,1.3,1.4,2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 9.1, 9.2, 10.1, 10.2,11.1, 11.2, 12.1, 12.2, 13.1, 13.2, 14.1, 14.2, 15.1, 15.2, 16.1, 16.2, 17.1, 17.2, 18.1, 18.2,19.1, 19.2, 20.1, 20.2, 21.1, 21.2}\.\d)$/.test(text)) {
                    await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
                }

                // --- Handle options ---
                switch (text) {
                    case '1.1': await reply("✅ Public Mode enabled"); break;
                    case '1.2': await reply("✅ Private Mode enabled"); break;
                    case '1.3': await reply("✅ Group Mode enabled"); break;
                    case '1.4': await reply("✅ Inbox Mode enabled"); break;
                    case '2.1': await reply("✅ Auto Recording ON"); break;
                    case '2.2': await reply("❌ Auto Recording OFF"); break;
                    case '3.1': await reply("✅ Auto Typing ON"); break;
                    case '3.2': await reply("❌ Auto Typing OFF"); break;
                    case '4.1': await reply("✅ Always Online ON"); break;
                    case '4.2': await reply("❌ Always Online OFF"); break;
                    case '5.1': await reply("✅ Public Mod ON"); break;
                    case '5.2': await reply("❌ Public Mod OFF"); break;
                    case '6.1': await reply("✅ Auto Voice ON"); break;
                    case '6.2': await reply("❌ Auto Voice OFF"); break;
                    case '7.1': await reply("✅ Auto Sticker ON"); break;
                    case '7.2': await reply("❌ Auto Sticker OFF"); break;
                    case '8.1': await reply("✅ Auto Reply ON"); break;
                    case '8.2': await reply("❌ Auto Reply OFF"); break;
                    case '9.1': await reply("✅ Auto React ON"); break;
                    case '9.2': await reply("❌ Auto React OFF"); break;
                    case '10.1': await reply("✅ Auto Status Seen ON"); break;
                    case '10.2': await reply("❌ Auto Status Seen OFF"); break;
                    case '11.1': await reply("✅ Auto Status Reply ON"); break;
                    case '11.2': await reply("❌ Auto Status Reply OFF"); break;
                    case '12.1': await reply("✅ Auto Status React ON"); break;
                    case '12.2': await reply("❌ Auto Status React OFF"); break;
                    case '13.1': await reply("✅ Custom React ON"); break;
                    case '13.2': await reply("❌ Custom React OFF"); break;
                    case '14.1': await reply("✅ Anti VV ON"); break;
                    case '14.2': await reply("❌ Anti VV OFF"); break;
                    case '15.1': await reply("✅ Welcome ON"); break;
                    case '15.2': await reply("❌ Welcome OFF"); break;
                    case '16.1': await reply("✅ Admin Events ON"); break;
                    case '16.2': await reply("❌ Admin Events OFF"); break;
                    case '17.1': await reply("✅ Anti Link ON"); break;
                    case '17.2': await reply("❌ Anti Link OFF"); break;
                    case '18.1': await reply("✅ Read Message ON"); break;
                    case '18.2': await reply("❌ Read Message OFF"); break;
                    case '19.1': await reply("✅ Anti Bad ON"); break;
                    case '19.2': await reply("❌ Anti Bad OFF"); break;
                    case '20.1': await reply("✅ Anti Link Kick ON"); break;
                    case '20.2': await reply("❌ Anti Link Kick OFF"); break;
                    case '21.1': await reply("✅ Read CMD ON"); break;
                    case '21.2': await reply("❌ Read CMD OFF"); break;

                    case 'exit':
                        await reply("✅ Settings menu closed.");
                        conn.ev.off('messages.upsert', handler);
                        return;

                    default:
                        if (/^(\d{1.1,1.2,1.3,1.4,2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 9.1, 9.2, 10.1, 10.2,11.1, 11.2, 12.1, 12.2, 13.1, 13.2, 14.1, 14.2, 15.1, 15.2, 16.1, 16.2, 17.1, 17.2, 18.1, 18.2,19.1, 19.2, 20.1, 20.2, 21.1, 21.2}\.\d)$/.test(text)) {
                            await reply("❌ Invalid option, please select correctly.");
                        }
                }

            } catch (err) {
                console.error("Handler error:", err);
            }
        };

        conn.ev.on('messages.upsert', handler);

    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error: ${error.message}`);
    }
});
