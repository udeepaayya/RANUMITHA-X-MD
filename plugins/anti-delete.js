//=====================================//
//     ANTI DELETE SYSTEM - RANUMITHA  //
//=====================================//

const { cmd } = require('../command');
const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config');

// 🗃️ Database Model
const AntiDelDB = DATABASE.define('AntiDelete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: config.ANTI_DELETE || false,
    },
}, {
    tableName: 'antidelete',
    timestamps: false,
});

// 🔄 Functions
async function getAnti() {
    const data = await AntiDelDB.findByPk(1);
    if (!data) {
        await AntiDelDB.create({ id: 1, status: config.ANTI_DELETE || false });
        return config.ANTI_DELETE || false;
    }
    return data.status;
}

async function setAnti(value) {
    await AntiDelDB.upsert({ id: 1, status: value });
}

// ⚙️ Initialization — Apply config value on start
(async () => {
    try {
        await setAnti(config.ANTI_DELETE);
        console.log(`[INIT] Anti-delete default set to: ${config.ANTI_DELETE ? 'ON' : 'OFF'}`);
    } catch (err) {
        console.error("❌ Failed to initialize Anti-delete setting:", err);
    }
})();

// 💬 Command
cmd({
    pattern: "antidelete",
    alias: ['antidel', 'del'],
    desc: "Toggle anti-delete feature",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isOwner }) => {
    if (!isOwner) return reply('⚠️ This command is only for the bot owner.');

    try {
        const currentStatus = await getAnti();

        if (!text || text.toLowerCase() === 'status') {
            return reply(`*🧩 AntiDelete Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\n*Usage:*\n• .antidelete on - Enable\n• .antidelete off - Disable`);
        }

        const action = text.toLowerCase().trim();

        if (action === 'on') {
            await setAnti(true);
            return reply('✅ Anti-delete feature has been *enabled*!');
        } 
        else if (action === 'off') {
            await setAnti(false);
            return reply('❌ Anti-delete feature has been *disabled*!');
        } 
        else {
            return reply('Invalid command.\n\nUsage:\n• .antidelete on\n• .antidelete off\n• .antidelete status');
        }

    } catch (err) {
        console.error("❌ Error in antidelete command:", err);
        return reply("An error occurred while processing your request.");
    }
});

// 🧠 Export for other files if needed
module.exports = { getAnti, setAnti };
