const { cmd } = require('../command');
const axios = require('axios');

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
    pattern: "getimage",
    desc: "Convert image URL to WhatsApp image",
    alias: ["gimg", "getimg", "urltoimg"],
    category: "media",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!text) return reply('🖇️ *Give me a direct image URL!*');

        const imageUrl = text.trim();

        // Validate URL
        if (!imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
            return reply('❗ *This is NOT a direct image URL!*');
        }

        // Verify the image exists
        try {
            const response = await axios.head(imageUrl);
            if (!response.headers['content-type']?.startsWith('image/')) {
                return reply('*Error*');
            }
        } catch (e) {
            return reply('*Error*');
        }

        // Send the image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: '🖼️ *Your image is ready!*\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛'
        }, { quoted: fakevCard });

    } catch (error) {
        console.error('GetImage Error:', error);
        reply('*Error*: ' + error.message);
    }
});
