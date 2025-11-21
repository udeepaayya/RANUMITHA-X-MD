const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a replied user from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {

        if (!isGroup) return reply("📛 *Group command only!*");
        if (!isAdmins) return reply("📛 *Only admins can use this command!*");
        if (!isBotAdmins) return reply("📛 *Bot must be admin!*");

        if (!mek.message?.extendedTextMessage) {
            return reply("Reply to message and type *.kick*");
        }

        const mentionedJid = mek.message.extendedTextMessage.contextInfo.participant;
        if (!mentionedJid) return reply("⚠️ *Reply to the person you want to kick!*");

        // 🛡️ BOT SELF-KICK PROTECTION
        if (mentionedJid === conn.user.jid) {
            return reply("*😒 It's me..*");
        }

        // Kick user
        await conn.groupParticipantsUpdate(from, [mentionedJid], "remove");

        await conn.sendMessage(from, { 
            text: `✅ *Removed Successfully*`
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to remove the user!*");
    }
});
