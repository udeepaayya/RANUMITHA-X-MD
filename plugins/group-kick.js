const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, isBotAdmins, reply, quoted, senderNumber
}) => {

    // Group check
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Bot owner check
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    // Bot admin check
    if (!isBotAdmins) return reply("❌ I need to be an admin to remove members.");

    // Get number to kick
    let number;

    if (quoted) {
        number = quoted.sender.split("@")[0];     // Reply to user → get number
    } else {
        return reply("❌ Please *reply to a user's message* to remove them.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "remove");

        await reply(
            `✅ *Successfully Removed*\n\n👤 Number: *@${number}*`,
            { mentions: [jid] }
        );

    } catch (e) {
        console.error("Kick Error:", e);
        reply("❌ Failed to remove the member.");
    }
});
