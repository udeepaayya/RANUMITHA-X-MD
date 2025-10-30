const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "getdpcontact",
    react: "📱",
    alias: ["contactinfo", "numberdp"],
    desc: "Get WhatsApp profile picture, name, and about using number in message text",
    category: "utility",
    use: '.getdpcontact 94712345678',
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        // 1. GET NUMBER FROM MESSAGE
        let number = args[0];
        if (!number) return reply("❌ Please type a number.\nExample: *.getdpcontact 94762095308*");

        // 2. CLEAN AND FORMAT NUMBER
        number = number.replace(/[^0-9]/g, "");
        if (!number.startsWith("94")) number = "94" + number; // auto add SL code
        const userJid = number + "@s.whatsapp.net";

        // 3. VERIFY USER EXISTS ON WHATSAPP
        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ That number is not registered on WhatsApp.");

        // 4. GET PROFILE PICTURE
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png'; // default dp
        }

        // 5. GET NAME
        let userName = "";
        try {
            userName = user?.notify || user?.name || userJid.split('@')[0];
        } catch {
            userName = userJid.split('@')[0];
        }

        // 6. GET ABOUT / STATUS
        let bio = "No about available";
        try {
            const status = await conn.fetchStatus(userJid);
            if (status?.status) bio = status.status;
        } catch {}

        // 7. FORMAT MESSAGE
        const caption = `
*👤 WHATSAPP PROFILE INFO*

📛 *Name:* ${userName}
📞 *Number:* +${number}
📝 *About:* ${bio}
`.trim();

        // 8. SEND RESULT
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: mek });

    } catch (e) {
        console.error("getdpcontact command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get contact profile"}`);
    }
});
