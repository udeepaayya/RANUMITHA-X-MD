const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

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

// Supported global video extensions
const videoExts = [
    ".mp4", ".mkv", ".mov", ".webm", ".avi", ".flv",
    ".ts", ".m4v", ".3gp", ".mpeg", ".mpg"
];

// Check if URL looks like a direct video
function isDirectVideo(url) {
    const clean = url.split("?")[0].toLowerCase();
    return videoExts.some(ext => clean.endsWith(ext));
}

// Function to download video buffer from any URL
async function downloadBuffer(url) {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error("Invalid video URL or blocked");
    return Buffer.from(await res.arrayBuffer());
}

// Convert any video to MP4 using FFmpeg
function convertToMp4(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${inputPath}" -c:v libx264 -c:a aac "${outputPath}"`, (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve(outputPath);
        });
    });
}

cmd({
    pattern: "getvideo",
    alias: ["gvideo"],
    desc: "Download ANY video link (global support + auto convert to MP4)",
    category: "download",
    react: "🎥",
    use: ".getvideo <video-url>",
    filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {

    try {
        if (!q) return reply("🖇️ *Send me a video link!*");

        let url = q.trim();

        await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

        // Auto handle Google Drive links
        if (url.includes("drive.google.com")) {
            const id = url.match(/[-\w]{25,}/)?.[0];
            if (id) url = `https://drive.google.com/uc?id=${id}&export=download`;
        }

        // Download buffer
        const buffer = await downloadBuffer(url);

        // Temporary paths
        const tempInput = path.join(__dirname, "../temp/" + Date.now() + "_input");
        const tempOutput = path.join(__dirname, "../temp/" + Date.now() + "_output.mp4");

        fs.writeFileSync(tempInput, buffer);

        // Convert to MP4 if not MP4
        const finalPath = tempOutput;
        await convertToMp4(tempInput, finalPath);

        // Send video
        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

        await conn.sendMessage(from, {
            video: fs.readFileSync(finalPath),
            mimetype: "video/mp4",
            caption: "🎥 *Here is your video!*\n\n> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛"
        }, { quoted: fakevCard });

        // Clean temp files
        fs.unlinkSync(tempInput);
        fs.unlinkSync(finalPath);

        await conn.sendMessage(from, { react: { text: "✔️", key: mek.key } });

    } catch (err) {
        console.log(err);
        reply("❗ *Download failed or invalid link.* Only videos supported.");
    }
});
