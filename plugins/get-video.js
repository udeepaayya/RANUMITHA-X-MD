const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Fake vCard
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
FN:Meta AI
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

// Supported global video formats
const videoExts = [
    "mp4","mkv","mov","webm","avi","flv","ts","m4v","3gp","mpeg","mpg"
];

cmd({
    pattern: "getvideo",
    alias: ["gvideo"],
    desc: "Download ANY direct video link (global support)",
    category: "download",
    react: "🎥",
    use: ".getvideo <video-url>",
    filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {

    try {
        if (!q) return reply("🖇️ *Give me a valid direct video URL!*");

        let url = q.trim();

        // Fix Google Drive links automatic
        if (url.includes("drive.google.com")) {
            const id = url.match(/[-\w]{25,}/)?.[0];
            if (id) url = `https://drive.google.com/uc?id=${id}&export=download`;
        }

        await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

        // Fetch the file
        const res = await fetch(url, {
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!res.ok) throw new Error("Invalid or blocked video link.");

        const buffer = Buffer.from(await res.arrayBuffer());

        // Detect file name from header (universal support)
        let ext = ".mp4";

        const type = res.headers.get("content-type");
        const dispo = res.headers.get("content-disposition");

        // Detect from content-type
        if (type && type.includes("video/")) {
            const t = type.split("/")[1].split(";")[0];
            ext = "." + t;
        }

        // Detect from content-disposition
        if (dispo && dispo.includes("filename")) {
            const match = dispo.match(/filename="?(.+)"?/);
            if (match) ext = path.extname(match[1]) || ext;
        }

        // Detect from URL
        const urlExt = path.extname(url.split("?")[0]);
        if (urlExt.length <= 5 && videoExts.includes(urlExt.replace(".", ""))) {
            ext = urlExt;
        }

        const fileName = Date.now() + ext;
        const filePath = path.join(__dirname, "../temp/" + fileName);

        fs.writeFileSync(filePath, buffer);

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

        await conn.sendMessage(from, {
            video: fs.readFileSync(filePath),
            mimetype: "video/mp4",
            caption: "🎥 *Your video is ready!*\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛"
        }, { quoted: fakevCard });

        fs.unlinkSync(filePath);

        await conn.sendMessage(from, { react: { text: "✔️", key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❗ *Download failed.*\nOnly DIRECT video links supported.");
    }
});
