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

        // Must reply to someone
        if (!mek.message?.extendedTextMessage) {
            return reply("🔁 *Reply to someone's message and type .kick*");
        }

        // Target user JID
        const target = mek.message.extendedTextMessage.contextInfo.participant;

        // AUTO-DETECT BOT NUMBER
        const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";

        // BOT SELF-PROTECT
        if (target === botNumber) {
            return reply("🤖 *It's me! You can't remove me 😆*");
        }

        // Kick other members
        await conn.groupParticipantsUpdate(from, [target], "remove");

        await conn.sendMessage(from, { 
            text: `✅ *Removed Successfully*`
        });

    } catch (err) {
        console.log(err);
        reply("❌ *Failed to remove the user!*");
    }
});
