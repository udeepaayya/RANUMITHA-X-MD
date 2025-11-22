const { cmd } = require('../command');

cmd({
    pattern: "promote",
    alias: ["p", "admin", "makeadmin"],
    desc: "Promote a user to admin (reply or mention)",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, participants, reply }) => {
    try {
        if (!isGroup) return reply("📛 *Group command only!*");
        if (!isAdmins) return reply("📛 *Only group admins can use this command!*");
        if (!isBotAdmins) return reply("📛 *Bot must be admin first!*");

        // Get user from mention or reply
        let user = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] 
                   || mek.message?.extendedTextMessage?.contextInfo?.participant;

        if (!user) return reply("⚠️ *Reply to a user's message or tag them to promote!*"); 

        // Bot cannot promote itself
        const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        if (user === botJid) return;

        // Already admin check
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        if (groupAdmins.includes(user)) {
            return reply("*✅ That user is already an admin!*");
        }

        // Promote user
        await conn.groupParticipantsUpdate(from, [user], "promote");

        // Success message
        await conn.sendMessage(from, { 
            text: `✅ *Successfully Promoted:* @${user.split("@")[0]}`,
            mentions: [user]
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to promote user!*");
    }
});
