const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "getdpcontact",
    react: "👤",
    alias: ["targetdp", "contactdp"],
    desc: "Get the WhatsApp profile picture, name, and about of the person you sent the command to",
    category: "utility",
    use: '.getdpcontact',
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // 1️⃣ CHECK IF MESSAGE IS REPLY OR DIRECT CHAT
        let userJid;

        if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
            // if replied to someone
            userJid = mek.message.extendedTextMessage.contextInfo.participant;
        } else {
            // else get the chat target (the person you sent the message to)
            userJid = from.endsWith('@g.us') ? null : from;
        }

        if (!userJid) return reply("❌ Please use this command in a direct chat (not in group).");

        // 2️⃣ VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ That contact is not registered on WhatsApp.");

        // 3️⃣ GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; // default dp
        }

        // 4️⃣ GET NAME
        let userName = "";
        try {
            userName = user?.notify || user?.name || mek.pushName || userJid.split('@')[0];
        } catch {
            userName = userJid.split('@')[0];
        }

        // 5️⃣ GET ABOUT (bio)
        let bio = "No about info available";
        try {
            const status = await conn.fetchStatus(userJid);
            if (status?.status) bio = status.status;
        } catch {}

        // 6️⃣ FORMAT MESSAGE
        const caption = `
*👤 CONTACT PROFILE INFO*

📛 *Name:* ${userName}
📞 *Number:* +${userJid.replace(/@.+/, '')}
📝 *About:* ${bio}
`.trim();

        // 7️⃣ SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.error("getdpcontact command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get contact profile"}`);
    }
});
