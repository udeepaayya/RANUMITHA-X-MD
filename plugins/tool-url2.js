const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd, commands } = require("../command");

cmd({
  pattern: "url2",
  alias: ["upload2", "anontourl", "anonfile"],
  react: '🖇',
  desc: "Convert media to AnonFiles URL",
  category: "utility",
  use: ".url2 [reply to media]",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType) throw "Please reply to an image, video, or audio file";

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `anon_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Determine file extension
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('video')) extension = '.mp4';
    else if (mimeType.includes('audio')) extension = '.mp3';
    
    const fileName = `file${extension}`;

    // Prepare form data
    const form = new FormData();
    form.append('file', fs.createReadStream(tempFilePath));

    // Upload to AnonFiles
    const response = await axios.post("https://api.anonfiles.com/upload", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(tempFilePath);

    if (!response.data || !response.data.data || !response.data.data.file) {
      throw "Error uploading to AnonFiles";
    }

    const mediaUrl = response.data.data.file.url.full;

    // Determine media type for response
    let mediaType = 'File';
    if (mimeType.includes('image')) mediaType = 'Image';
    else if (mimeType.includes('video')) mediaType = 'Video';
    else if (mimeType.includes('audio')) mediaType = 'Audio';

    await reply(
      `*${mediaType} Uploaded Successfully*\n\n` +
      `*Size:* ${formatBytes(mediaBuffer.length)}\n` +
      `*URL:* ${mediaUrl}\n\n` +
      `> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`
    );

  } catch (error) {
    console.error(error);
    await reply(`Error: ${error.message || error}`);
  }
});

// Helper function
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
