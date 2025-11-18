const { cmd } = require("../command");

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
    pattern: "vv",
    alias: ["viewonce", "rview"],
    react: "🫟",
    desc: "Owner Only - Retrieve view once media",
    category: "owner",
    filename: __filename
}, async (client, message, match, { from, isOwner }) => {
    try {

        if (!isOwner) {
            return await client.sendMessage(from, {
                text: "*🚫 Owner Only Command!*"
            }, { quoted: message });
        }

        if (!message.quoted) {
            return await client.sendMessage(from, {
                text: "*🍁 Please reply to a view once message!*"
            }, { quoted: message });
        }

        const quoted = message.quoted;

        let buffer;

        // Try all compatible download methods
        if (typeof quoted.download === "function") {
            buffer = await quoted.download();
        } else if (typeof client.downloadMediaMessage === "function") {
            try {
                buffer = await client.downloadMediaMessage(quoted, "buffer", {});
            } catch {
                buffer = await client.downloadMediaMessage(quoted.message || quoted, "buffer", {});
            }
        } else {
            return await client.sendMessage(from, {
                text: "❌ Unable to download message. Baileys version incompatible."
            }, { quoted: message });
        }

        // Determine message type
        const mtype = quoted.mtype || Object.keys(quoted.message || {})[0] || "";
        let content = {};

        if (mtype.includes("image")) {
            content = { image: buffer, caption: quoted.text || "" };
        } else if (mtype.includes("video")) {
            content = { video: buffer, caption: quoted.text || "" };
        } else if (mtype.includes("audio")) {
            content = { audio: buffer, mimetype: "audio/mp4", ptt: false };
        } else {
            return await client.sendMessage(from, {
                text: "❌ Only image, video, and audio view-once are supported."
            }, { quoted: message });
        }

        // SEND with Fake vCard
        await client.sendMessage(from, content, { quoted: fakevCard });

    } catch (error) {
        console.error("vv Error:", error);
        await client.sendMessage(from, {
            text: "❌ Error fetching vv message:\n" + error.message
        }, { quoted: message });
    }
});
