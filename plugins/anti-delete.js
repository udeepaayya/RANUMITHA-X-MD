//=====================================//
//     SIMPLE ANTI DELETE SYSTEM       //
//         BY HIRUKA RANUMITHA         //
//=====================================//

const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

// ✅ Load Config
const configPath = path.join(__dirname, '../config.js');
let config = require('../config');

// 🔄 Helper functions
function getAnti() {
    return config.ANTI_DELETE === true;
}

function setAnti(value) {
    config.ANTI_DELETE = value;
    // 📝 Update config file value (save permanently)
    const newConfig = Object.entries(config)
        .map(([key, val]) => `    ${key}: ${typeof val === 'string' ? `'${val}'` : val},`)
        .join('\n');
    const updated = `module.exports = {\n${newConfig}\n};\n`;
    fs.writeFileSync(configPath, updated);
}

// 💬 Command
cmd({
    pattern: "antidelete",
    alias: ['antidel', 'del'],
    desc: "Toggle anti-delete feature (based on config)",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isOwner }) => {

    if (!isOwner) return reply('⚠️ This command is only for the bot owner.');

    try {
        const currentStatus = getAnti();

        if (!text || text.toLowerCase() === 'status') {
            return reply(`*🧩 AntiDelete Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\n*Usage:*\n• .antidelete on - Enable\n• .antidelete off - Disable`);
        }

        const action = text.toLowerCase().trim();

        if (action === 'on') {
            if (getAnti()) return reply('✅ Anti-delete is already ON');
            setAnti(true);
            return reply('✅ Anti-delete has been *enabled* and saved to config.');
        } 
        else if (action === 'off') {
            if (!getAnti()) return reply('❌ Anti-delete is already OFF');
            setAnti(false);
            return reply('❌ Anti-delete has been *disabled* and saved to config.');
        } 
        else {
            return reply('Invalid command.\n\nUsage:\n• .antidelete on\n• .antidelete off\n• .antidelete status');
        }

    } catch (err) {
        console.error("❌ Error in antidelete command:", err);
        return reply("An error occurred while processing your request.");
    }
});

// 🧠 Export Functions
module.exports = { getAnti, setAnti };
