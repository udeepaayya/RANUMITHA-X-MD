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

        // Check reply
        if (!mek.message?.extendedTextMessage) {
            return reply("🔁 *Reply to a user's message and type .kick*");
        }

        // Get replied user JID
        const mentionedJid = mek.message.extendedTextMessage.contextInfo.participant;
        if (!mentionedJid) return reply("⚠️ *Reply to the person you want to kick and send a kick!*");

        // BOT number protect
        const botNumber = conn.user.id?.split(":")[0] + "@s.whatsapp.net";

        if (mentionedJid === botNumber) {
            return reply("🤖 *It's me! I can't remove myself 😆*");
        }

        // Kick user
        await conn.groupParticipantsUpdate(from, [mentionedJid], "remove");

        // Success message
        await conn.sendMessage(from, { 
            text: `✅ *Removed Successfully*`
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to remove the user!*");
    }
});
