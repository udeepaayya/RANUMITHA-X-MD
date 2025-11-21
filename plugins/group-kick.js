const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a replied user from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply, sender, isOwner }) => {
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
        if (!mentionedJid) return reply("⚠️ *Reply to the person you want to kick and send .kick!*");

        // SELF-KICK PROTECTION
        if (mentionedJid === sender) {
            return reply("😒 It's me... I can't kick myself!");
        }

        // OWNER PROTECTION
        if (isOwner && mentionedJid === conn.user.jid) {
            return reply("😒 It's me... I can't kick myself!");
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
