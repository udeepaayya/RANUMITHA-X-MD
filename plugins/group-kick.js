const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a user from the group by reply or mention",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply("📛 *Group command only!*");
        if (!isAdmins) return reply("📛 *Only admins can use this command!*");
        if (!isBotAdmins) return reply("📛 *Bot must be admin!*");

        let mentionedJid;

        // If user is mentioned in the command
        if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            mentionedJid = mek.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // If no mention, check if it's a reply
        else if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
            mentionedJid = mek.message.extendedTextMessage.contextInfo.participant;
        } else {
            return reply("⚠️ *Reply to a user's message or mention them to kick!*"); 
        }

        // BOT number detect
        const botJid = conn.user.id?.split(":")[0] + "@s.whatsapp.net";

        if (mentionedJid === botJid) {
            return reply("😒 *It's me!*");
        }

        await conn.groupParticipantsUpdate(from, [mentionedJid], "remove");

        await conn.sendMessage(from, { 
            text: `✅ *Removed Successfully*`
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to remove the user!*");
    }
});
