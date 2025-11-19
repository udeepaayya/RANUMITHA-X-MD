const { cmd } = require('../command');

cmd({
    pattern: "kick",
    alias: ["remove", "k"],
    desc: "Remove user from the group (Owner Only)",
    category: "admin",
    react: "❌",
    filename: __filename
},

async (conn, mek, m, { from, isGroup, isBotAdmins, reply, quoted, senderNumber }) => {

    if (!isGroup) return reply("❌ Group command only.");

    // bot owner only
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner)
        return reply("❌ Only bot owner can use this command.");

    if (!isBotAdmins)
        return reply("❌ Bot must be admin.");

    if (!quoted)
        return reply("❌ Reply to the user you want to remove.");

    // CLEAN sender JID
    let num = quoted.sender.split("@")[0];
    num = num.replace(/[^0-9]/g, "");  // remove device suffix, +, spaces, symbols
    const jid = num + "@s.whatsapp.net";

    try {
        const res = await conn.groupParticipantsUpdate(
            from,
            [jid],
            "remove"
        );

        // WhatsApp returns status codes
        if (res[0]?.status === 200) {
            return reply(`✅ Successfully removed @${num}`, { mentions: [jid] });
        } else {
            return reply(`❌ Failed (status: ${res[0]?.status})`);
        }

    } catch (err) {
        console.log("REMOVE ERROR:", err);
        return reply("❌ WhatsApp rejected the request.");
    }

});
