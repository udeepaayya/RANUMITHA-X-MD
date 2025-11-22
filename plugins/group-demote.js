const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, mentionedJid,
    isGroup, sender, botNumber, participants, isAdmins, isBotAdmins, reply
}) => {
    try {
        // Only in groups
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        // Only group admins
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        // Bot must be admin
        if (!isBotAdmins) return reply("❌ I need to be an admin to demote someone.");

        let targetJid;

        // Get the user from reply or mention
        if (quoted) {
            targetJid = quoted.sender;
        } else if (mentionedJid && mentionedJid.length) {
            targetJid = mentionedJid[0];
        } else {
            return reply("❌ Please reply to a message or mention a user to demote.");
        }

        // Find the target in participants
        const target = participants.find(p => p.id === targetJid);
        if (!target) return reply("❌ User not found in this group.");

        // Prevent demoting bot or owner
        if (targetJid === botNumber) return reply("❌ I cannot demote myself.");
        if (target.isOwner) return reply("❌ Cannot demote the group owner.");

        // Check if the target is an admin
        if (!target.admin) return reply("❌ That user is not an admin.");

        // Demote the user
        await conn.groupParticipantsUpdate(from, [targetJid], "demote");
        reply(`✅ Successfully demoted @${targetJid.split("@")[0]} to a normal member.`, { mentions: [targetJid] });

    } catch (error) {
        console.error("Demote command error:", error);
        reply("❌ Failed to demote the member.");
    }
});
