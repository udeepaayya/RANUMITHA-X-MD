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
    from, quoted, body, args, q,
    isGroup, sender, botNumber, participants, isAdmins, isBotAdmins, reply
}) => {
    try {
        // Only usable in groups
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        // Only admins can use it
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        // Bot must be admin
        if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

        let number;

        // Get number from reply, mention, or args
        if (m.quoted) {
            number = m.quoted.sender.replace(/\D/g, '');
        } else if (q) {
            number = q.replace(/\D/g, '');
        } else if (args && args[0]) {
            number = args[0].replace(/\D/g, '');
        } else {
            return reply("❌ Please reply to a message, mention, or provide a number to demote.");
        }

        // Ensure number is valid
        if (!number) return reply("❌ Invalid number provided.");

        const jid = number + "@s.whatsapp.net";

        // Find the target in participants
        const target = participants.find(p => p.id.includes(number));
        if (!target) return reply(`❌ User ${number} not found in this group.`);

        // Prevent demoting bot or owner
        if (jid === botNumber) return reply("❌ I cannot demote myself.");
        if (target.isOwner) return reply("❌ Cannot demote the group owner.");

        // Check if the target is actually an admin
        if (!target.admin) return reply("❌ That user is not an admin.");

        // Perform the demote
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        reply(`✅ Successfully demoted @${number} to a normal member.`, { mentions: [jid] });

    } catch (error) {
        console.error("Demote command error:", error);
        reply("❌ Failed to demote the member.");
    }
});
