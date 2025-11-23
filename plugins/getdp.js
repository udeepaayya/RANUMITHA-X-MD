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
    desc: "Get profile picture, name, number, about (reply & tag supported)",
    category: "utility",
    use: '.getdp @tag / reply',
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {

        let targetJid;

        // 🟢 1. If reply-user
        if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = mek.message.extendedTextMessage.contextInfo.participant;

        // 🟢 2. If @mention user
        } else if (mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = mek.message.extendedTextMessage.contextInfo.mentionedJid[0];

        // 🟡 3. Otherwise default = chat
        } else {
            targetJid = from;
        }

        let ppUrl;
        let caption = "";

        // 🔵 If group
        if (targetJid.endsWith("@g.us")) {
            const groupMetadata = await conn.groupMetadata(targetJid);
            const name = groupMetadata.subject || "Group";
            const bio = `Group with ${groupMetadata.participants.length} members`;

            try {
                ppUrl = await conn.profilePictureUrl(targetJid, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }

            caption = `*👥 GROUP INFO*\n\n📛 *Name:* ${name}\n💬 *About:* ${bio}\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        } else {

            // 🔴 Individual
            try {
                ppUrl = await conn.profilePictureUrl(targetJid, 'image');
            } catch {
                ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
            }

            const number = `+${targetJid.replace(/@.+/, '')}`;
            caption = `*👤 CONTACT INFO*\n\n📞 *Number:* ${number}\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;
        }

        // Send DP
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption
        }, { quoted: fakevCard });

    } catch (e) {
        console.error("getdp command error:", e);
        reply(`❌ Error: ${e.message || "Failed to get profile"}`);
    }
});
