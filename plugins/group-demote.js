const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["d", "removeadmin", "radmin"],
    desc: "Demote an admin to normal user (reply or mention)",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, participants, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command works only in groups!");
        if (!isBotAdmins) return reply("⚠️ I must be an admin to demote someone!");
        if (!isAdmins) return reply("⚠️ You must be an admin to use this command!");

        let user;
        // Reply method
        if (m.quoted) {
            user = m.quoted.sender;
        } 
        // Mention method
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            user = m.mentionedJid[0];
        } 
        else {
            return reply("⚠️ Reply to a user or mention them to demote!");
        }

        // Check if user is admin
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        if (!groupAdmins.includes(user)) {
            return reply("✅ That user is not an admin!");
        }

        // Demote the user
        await conn.groupDemoteAdmin(from, [user]);
        reply(`⬇️ Successfully demoted the user!`);
    } catch (err) {
        console.log(err);
        reply("❌ Failed to demote the user.");
    }
});
