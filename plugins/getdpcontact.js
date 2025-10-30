const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "getdpcontact",
    react: "👤",
    alias: ["senderinfo", "senderdp"],
    desc: "Get WhatsApp profile picture, name, and about of the message sender",
    category: "utility",
    use: '.getdpcontact',
    filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
    try {
        // 1. GET SENDER JID
        const userJid = sender;

        // 2. VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ Sender not found on WhatsApp.");

        // 3. GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; // default dp
        }

        // 4. GET DISPLAY NAME
        let userName = "";
        try {
            userName = user?.notify || mek.pushName || user?.name || userJid.split('@')[0];
        } catch {
            userName = userJid.split('@')[0];
        }

        // 5. GET ABOUT (Bio)
        let bio = "No about available";
        try {
            const status = await conn.fetchStatus(userJid);
            if (status?.status) bio = status.status;
        } catch {}

        // 6. FORMAT OUTPUT
        const caption = `
*👤 CONTACT PROFILE INFO*

📛 *Name:* ${userName}
📞 *Number:* +${userJid.replace(/@.+/, '')}
📝 *About:* ${bio}
`.trim();

        // 7. SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.error("getdpcontact command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get contact profile"}`);
    }
});
