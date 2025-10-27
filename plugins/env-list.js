const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Helper: check if enabled
function isEnabled(value) {
    return value === "true" || value === true;
}

// Helper: save config permanently
function saveConfig() {
    fs.writeFileSync("./config.js", `module.exports = ${JSON.stringify(config, null, 4)};`);
}

// Owner-only settings menu
cmd({ 
    pattern: "settings", 
    desc: "Owner-only interactive settings menu", 
    category: "system", 
    react: "⚙️", 
    filename: __filename 
}, async (conn, mek, m, { from, isOwner, reply }) => {
    try {

        if (!isOwner) {
            return await reply("❌ Owner Only!");
        }

        const fakevCard = { 
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" }, 
            message: { contactMessage: { displayName: "© Bot", vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Bot\nEND:VCARD` } } 
        };

        const menuText = `
╭─『 ⚙️ SETTINGS MENU ⚙️ 』
│ 1. Mode: ${config.MODE.toUpperCase()}
│ 2. Auto Recording: ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"} (2.1 ON / 2.2 OFF)
│ 3. Auto Typing: ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"} (3.1 ON / 3.2 OFF)
│ ... add your other options ...
╰───────────────────╯
Reply with the number to toggle the option.
`;

        await conn.sendMessage(from, { text: menuText }, { quoted: fakevCard });

        // Listen for owner replies
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const mekInfo = msgUpdate?.messages[0];
            if (!mekInfo?.message) return;
            const fromUser = mekInfo.key.remoteJid;
            const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;

            if (!textMsg) return;

            // Only allow owner to toggle
            if (!isOwner) return await conn.sendMessage(fromUser, { text: "❌ Owner Only!" });

            const replyNum = textMsg.trim();

            const commandMap = {
                "2.1": { key: "AUTO_RECORDING", value: "true" },
                "2.2": { key: "AUTO_RECORDING", value: "false" },
                "3.1": { key: "AUTO_TYPING", value: "true" },
                "3.2": { key: "AUTO_TYPING", value: "false" },
                // Add more options as needed
            };

            const selected = commandMap[replyNum];
            if (!selected) return await conn.sendMessage(fromUser, { text: "❌ Invalid choice!" });

            // Already ON/OFF check
            if ((selected.value === "true" && isEnabled(config[selected.key])) || 
                (selected.value === "false" && !isEnabled(config[selected.key]))) {
                await conn.sendMessage(fromUser, { text: `⚠️ ${selected.key} is already ${selected.value === "true" ? "ON" : "OFF"}` });
                return;
            }

            config[selected.key] = selected.value;
            saveConfig();

            await conn.sendMessage(fromUser, { text: `✅ ${selected.key} has been turned ${selected.value === "true" ? "ON" : "OFF"}` });
        });

    } catch (error) {
        console.error(error);
        await reply("❌ Error opening settings menu.");
    }
});
