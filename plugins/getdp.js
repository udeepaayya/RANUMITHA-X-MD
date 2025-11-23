const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

// Fake ChatGPT vCard
const fakevCard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

cmd({
    pattern: "getdp",
    alias: ["targetdp", "getpp", "getprofile"],
    react: "🖼️",
    desc: "Get profile picture of user/group (reply, tag supported)",
    category: "utility",
    use: ".getdp @user / reply",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {

        let targetJid;

        // 🟢 1. Reply-user
        if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = mek.message.extendedTextMessage.contextInfo.participant;

        // 🟢 2. Tagged user
        } else if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = mek.message.extendedTextMessage.contextInfo.mentionedJid[0];

        // 🟡 3. Default = chat JID
        } else {
            targetJid = from;
        }

        let ppUrl;
        let caption = "";

        // =====================================================
        //               GROUP DP HANDLING
        // =====================================================
        if (targetJid.endsWith("@g.us")) {

            const groupMetadata = await conn.groupMetadata(targetJid);
            const name = groupMetadata.subject || "Group";

            try {
                ppUrl = await conn.profilePictureUrl(targetJid, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }

            caption = `*👥 GROUP INFO*\n\n📛 *Name:* ${name}\n💬 *About:* Group with ${groupMetadata.participants.length} members\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        // =====================================================
        //               USER DP HANDLING
        // =====================================================
        } else {

            try {
                ppUrl = await conn.profilePictureUrl(targetJid, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }

            const numberTag = "@" + targetJid.split("@")[0];

            caption = `*👤 CONTACT INFO*\n📞 *Number:* ${numberTag}\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;
        }

        // =====================================================
        //               SEND FINAL DP WITH TAG
        // =====================================================
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption,
            mentions: [targetJid]  // required for tagging
        }, { quoted: fakevCard });

    } catch (e) {
        console.error("getdp error:", e);
        reply(`❌ Error: ${e.message || "Failed to get profile picture"}`);
    }
});
