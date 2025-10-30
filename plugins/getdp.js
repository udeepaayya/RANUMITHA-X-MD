const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "getdp",
    react: "🖼️",
    alias: ["getprofilepic", "fetchdp"],
    desc: "Get WhatsApp profile picture, name, and about using phone number",
    category: "utility",
    use: '.getdp 94712345678',
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        // 1. CHECK INPUT
        if (!args[0]) return reply("❌ Please provide a WhatsApp number.\nExample: *.getdp 94712345678*");

        // 2. FORMAT NUMBER
        let number = args[0].replace(/[^0-9]/g, "");
        if (!number.startsWith("94")) number = "94" + number; // auto add SL country code
        const userJid = number + "@s.whatsapp.net";

        // 3. VERIFY USER EXISTS
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ That number is not registered on WhatsApp.");

        // 4. GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; // default
        }

        // 5. GET NAME (pushname)
        let userName = "";
        try {
            const contactInfo = await conn.fetchStatus(userJid).catch(() => null);
            userName = user?.notify || user?.name || contactInfo?.pushname || number;
        } catch (e) {
            userName = number;
        }

        // 6. GET BIO / ABOUT
        let about = "No about info available";
        try {
            const status = await conn.fetchStatus(userJid);
            if (status?.status) {
                about = status.status;
            }
        } catch (e) {}

        // 7. FORMAT OUTPUT MESSAGE
        const caption = `
*👤 WHATSAPP PROFILE INFO*

📛 *Name:* ${userName}
📞 *Number:* +${number}
📝 *About:* ${about}
`.trim();

        // 8. SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.error("getdp command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get profile info"}`);
    }
});
