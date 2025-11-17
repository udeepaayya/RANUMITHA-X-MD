const { cmd } = require('../command');
const { exec } = require('child_process');
const config = require('../config');

cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ *This Is An Owner Command..!*");
    if (!quoted) return reply("🥲 *Please Reply To The User You Want To Block.*");

    const user = quoted.sender;
    try {
        await conn.updateBlockStatus(user, 'block');
        reply(`✔️ User ${user} Blocked Succesfully`);
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});
