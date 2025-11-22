const { cmd } = require('../command');

cmd({
    pattern: "d",
    alias: ["demote", "removeadmin", "radmin",],
    desc: "Demote an admin to normal user (reply or mention)",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, participants, reply }) => {
    try {
        // Only in groups
        if (!isGroup) return reply("📛 *Group command only!*");

        // Only group admins can use
        if (!isAdmins) return reply("📛 *Only group admins can use this command!*");

        // Bot must be admin
        if (!isBotAdmins) return reply("📛 *Bot must be admin first!*");

        // Get user to demote (from mention or reply)
        let quoted = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] 
                   || mek.message?.extendedTextMessage?.contextInfo?.participant;

        if (!quoted) return reply("⚠️ *Reply to a user's message or tag them to demote!*"); 

        // Bot cannot demote itself
        const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        if (quoted === botJid) return reply("😒 *It's me!*");

        // ✅ Check if user is already not an admin
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        if (!groupAdmins.includes(quoted)) {
            return reply("✅ That user is not an admin!");
        }

        // Demote user
        await conn.groupParticipantsUpdate(from, [quoted], "demote");

        // Success message
        await conn.sendMessage(from, { 
            text: `✅ *Successfully Demoted:* @${quoted.split("@")[0]}`,
            mentions: [quoted]
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to demote user!*");
    }
});
