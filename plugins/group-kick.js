const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a replied user",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {

        if (!isGroup) return reply("📛 *Group command only!*");
        if (!isAdmins) return reply("📛 *Only admins can use this command!*");
        if (!isBotAdmins) return reply("📛 *Bot must be admin!*");

        // Check reply to message
        if (!mek.message?.extendedTextMessage) {
            return reply("🔁 *Reply to a user's message and type .kick*");
        }

        // Get replied JID
        const target = mek.message.extendedTextMessage.contextInfo.participant;
        if (!target) return reply("⚠️ *Reply to someone!*");

        // BOT JID detect
        const botJid = conn.user.id.split(":")[0] + "@s.whatsapp.net";

        // IF ADMIN TRIES TO KICK BOT
        if (target === botJid) {
            return reply("🤖 *It's me! I can't remove myself 😆*");
        }

        // Kick normal users
        await conn.groupParticipantsUpdate(from, [target], "remove");

        await conn.sendMessage(from, { 
            text: `✅ *Removed Successfully*`
        });

    } catch (e) {
        console.log(e);
        reply("❌ *Failed to remove user!*");
    }
});
