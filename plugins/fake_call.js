const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

// Catbox uploader
async function uploadToCatbox(buffer, filename='file.jpg') {
    const tempPath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempPath, buffer);

    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempPath), filename);
    form.append('reqtype', 'fileupload');

    try {
        const { data } = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });
        fs.unlinkSync(tempPath);
        return data; // URL string
    } catch(e) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        console.error('Catbox upload error:', e);
        return null;
    }
}

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



// Plugin command
cmd({
  pattern: "fakecall",
  alias: "call",
  desc: "Make fake call image (WHITESHADOW-MD caption)",
  category: "maker",
  react: "📞",
  use: ".fakecall Name|Duration (reply with image)",
  filename: __filename
}, async (conn, m, mek, { from, args, reply, usedPrefix, command }) => {
  try {
    if (!args[0] || !args.join(' ').includes('|')) return reply(`❗ Use *Name|Duration* format!\nExample: ${usedPrefix + command} Chamod|10`);

    let quoted = m.quoted ? m.quoted : m;
    let mime = (quoted.msg || quoted).mimetype || '';
    if (!mime || !/image\/(jpeg|png)/.test(mime)) return reply('*🍁 Reply to a JPG/PNG image or send image with caption command!*');

    const mediaBuffer = await quoted.download().catch(() => null);
    if (!mediaBuffer) return reply('*⚠️ Image download fail, try again!*');

    const uploadedUrl = await uploadToCatbox(mediaBuffer, 'fakecall.jpg');
    if (!uploadedUrl) return reply('*⚠️ Upload fail, try again later!*');

    let [name, duration] = args.join(' ').split('|').map(s => s.trim());
    if (!name || !duration) return reply(`🌱 Wrong format!\nExample: ${usedPrefix + command} Chamod|10`);

    await reply('*⏳ Working on it..*');

    const apiUrl = `https://api.zenzxz.my.id/maker/fakecall?nama=${encodeURIComponent(name)}&durasi=${encodeURIComponent(duration)}&avatar=${encodeURIComponent(uploadedUrl)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) return reply('*🍂 API error, try again later!*');

    const arrayBuffer = await res.arrayBuffer().catch(() => null);
    if (!arrayBuffer) return reply(*'🍂 API returned no image.*');

    const buffer = Buffer.from(arrayBuffer);

    const caption = `✨ *RANUMITHA-X-MD Bot* ✨
🧑‍💻 By: *Ranumitha tech Team*

📌 Action: Fake Call
👤 Name: ${name}
⏰ Duration: ${duration} sec

🔗 URL: ${uploadedUrl}

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    await conn.sendMessage(from, { image: buffer, caption }, { quoted: fakevCard });

  } catch (e) {
    console.error(e);
    reply('*🍂 Oops! Something went wrong making fakecall 😢*');
  }
});
