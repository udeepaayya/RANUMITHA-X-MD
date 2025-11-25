const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a user from the group by reply or mention (Owner only)",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isOwner, reply }) => {
    try {
        // Only work in groups
        if (!isGroup) return reply("📛 *Group command only!*");

        // Owner check
        if (!isOwner) return reply("📛 *Only the bot owner can use this command!*");

        // Bot must be admin
        if (!isBotAdmins) return reply("📛 *Bot must be admin to remove participants!*");

        let mentionedJid;

        // Mentioned
        if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            mentionedJid = mek.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Reply
        else if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
            mentionedJid = mek.message.extendedTextMessage.contextInfo.participant;
        } else {
            return reply("⚠️ *Reply to a user's message or mention them to kick!*"); 
        }

        // Prevent kicking bot itself
        const botJid = conn.user.id?.split(":")[0] + "@s.whatsapp.net";
        if (mentionedJid === botJid) {
            return reply("😒 *Cannot remove the bot itself!*");
        }

        // Remove user
        await conn.groupParticipantsUpdate(from, [mentionedJid], "remove");

        await conn.sendMessage(from, { 
            text: `✅ *Successfully Removed:* @${mentionedJid.split("@")[0]}`,
            mentions: [mentionedJid]
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to remove the user!*");
    }
});
