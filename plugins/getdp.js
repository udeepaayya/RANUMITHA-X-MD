cmd({
    pattern: "getdp",
    alias: ["targetdp", "getpp", "getprofile"],
    react: "🖼️",
    desc: "Get the WhatsApp profile picture, name, and about of the person or group",
    category: "utility",
    use: '.getdp',
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        let ppUrl;
        let name = "";
        let bio = "No about info available";

        // 1️⃣ If it's a group
        if (from.endsWith('@g.us')) {
            // Fetch group metadata
            const groupMetadata = await conn.groupMetadata(from);
            name = groupMetadata.subject || "Group";
            try {
                ppUrl = await conn.profilePictureUrl(from, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }
            bio = `Group with ${groupMetadata.participants.length} members`;
        } else {
            // 2️⃣ Individual user
            let userJid = mek.message?.extendedTextMessage?.contextInfo?.participant || from;
            const [user] = await conn.onWhatsApp(userJid).catch(() => []);
            if (!user?.exists) return reply("❌ That contact is not registered on WhatsApp.");

            try {
                ppUrl = await conn.profilePictureUrl(userJid, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }

            name = user?.notify || user?.name || mek.pushName || userJid.split('@')[0];

            try {
                const status = await conn.fetchStatus(userJid);
                if (status?.status) bio = status.status;
            } catch {}
        }

        // 3️⃣ Send result
        const caption = `*  PROFILE INFO\n\n📛 *Name:* ${name}\n\n💬 *About:* ${bio}\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`.trim();

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: fakevCard });

    } catch (e) {
        console.error("getdp command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get profile"}`);
    }
});
