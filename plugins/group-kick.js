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

    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Only BOT OWNER
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return reply("❌ Only the bot owner can use this command.");
    }

    if (!isBotAdmins) return reply("❌ I need to be an admin to remove members.");

    if (!quoted) return reply("❌ Please reply to the user's message you want to remove.");

    // --- FIXED JID CLEANER ---
    let raw = quoted.sender || "";
    raw = raw.split("@")[0];       // remove '@s.whatsapp.net'
    raw = raw.replace(/[:\D]/g, ""); // remove ':24', spaces, symbols

    const jid = raw + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "remove");

        return reply(
            `✅ Successfully removed @${raw}`,
            { mentions: [jid] }
        );

    } catch (e) {
        console.error("KICK ERROR:", e);
        return reply("❌ Failed to remove the member. (API Reject)");
    }
});
