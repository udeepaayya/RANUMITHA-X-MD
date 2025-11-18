const { cmd } = require("../command");

cmd({
  pattern: "vv",
  alias: ["viewonce", "rview"],
  react: "🫟",
  desc: "Owner Only - Retrieve view once media",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {

    // Owner check
    if (!isOwner) {
      return await client.sendMessage(from, {
        text: "*🚫 Owner Only Command!*"
      }, { quoted: message });
    }

    // Check reply
    if (!message.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view-once message!*"
      }, { quoted: message });
    }

    const quoted = message.quoted;

    // Download buffer FIXED
    const buffer = await quoted.download();  

    const mtype = quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};

    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: quoted.text || "",
          mimetype: quoted.mimetype || "image/jpeg"
        };
        break;

      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: quoted.text || "",
          mimetype: quoted.mimetype || "video/mp4"
        };
        break;

      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: quoted.ptt || false
        };
        break;

      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported!"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);

  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});
