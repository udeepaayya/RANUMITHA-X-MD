const { cmd } = require('../command');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

cmd({
    pattern: "getvoice",
    alias: ["gv"],
    desc: "Convert any audio URL into WhatsApp voice note",
    category: "owner",
    react: "🎤",
    filename: __filename
},
async (robin, mek, m, { from, isOwner, args }) => {
    try {
        if (!isOwner) return mek.reply("❌ Owner only command!");

        const url = args[0];
        if (!url) return mek.reply("⚠️ Send an audio URL.\nExample:\n.getvoice https://example.com/audio.mp3");

        mek.reply("⬇️ Downloading & converting to WhatsApp voice...");

        // Download audio as buffer
        const audioData = await axios.get(url, { responseType: "arraybuffer" });
        const inputBuffer = Buffer.from(audioData.data);

        // Convert to OPUS (WhatsApp voice format)
        const convertToOpus = () => new Promise((resolve, reject) => {
            const stream = ffmpeg()
                .input(Buffer.from(inputBuffer))
                .inputFormat('mp3')
                .audioCodec('libopus')
                .format('opus')
                .on('error', reject)
                .on('end', () => resolve(output));
            
            let output = [];
            stream.pipe()
                .on('data', chunk => output.push(chunk))
                .on('end', () => resolve(Buffer.concat(output)));

            stream.run();
        });

        const opusBuffer = await convertToOpus();

        await robin.sendPresenceUpdate("recording", from);

        await robin.sendMessage(from, {
            audio: opusBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true
        }, { quoted: mek });

        mek.reply("✔️ WhatsApp voice note sent!");

    } catch (e) {
        console.log(e);
        mek.reply("❌ Conversion failed! Invalid URL or ffmpeg error.");
    }
});
