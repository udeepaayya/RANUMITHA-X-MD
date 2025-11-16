const { cmd } = require("../command");

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward media/message to inbox + groups",
  category: "owner",
  filename: __filename
}, 

async (client, message, match, { isOwner }) => {
  try {

    if (!isOwner) return message.reply("📛 *Owner Only Command!*");
    if (!message.quoted) return message.reply("📝 *Please reply to a message*");

    let raw = (match || "").toString().trim();
    if (!raw) return message.reply("❌ *Please give JIDs*\nExample:\n.fwd 9471xxxxxxx@s.whatsapp.net,12036xxxxx@g.us");

    // Split comma / spaces
    let splitJids = raw.split(/[\s,]+/).filter(x => x.trim());

    // Limit to 25
    splitJids = splitJids.slice(0, 25);

    // Validate only these 2 EXACT formats
    let validJids = splitJids.map(jid => {
      jid = jid.trim();

      // Inbox JID (exact format)
      if (/^\d{8,15}@s\.whatsapp\.net$/i.test(jid)) {
        return jid;
      }

      // Group JID (exact format)
      if (/^\d{10,20}@g\.us$/i.test(jid)) {
        return jid;
      }

      return null;
    }).filter(Boolean);

    if (validJids.length === 0) {
      return message.reply(
        "❌ *Invalid JID Format!*\n\n" +
        "📩 *Inbox JID Example:*\n94713119712@s.whatsapp.net\n\n" +
        "👥 *Group JID Example:*\n120363405061356141@g.us"
      );
    }

    // Detect message type
    let msgType = message.quoted.mtype;
    let toSend = {};

    if (message.quoted.download) {
      let buff = await message.quoted.download();

      if (msgType === "imageMessage") {
        toSend = { image: buff, caption: message.quoted.text || "" };
      } 
      else if (msgType === "videoMessage") {
        toSend = { video: buff, caption: message.quoted.text || "" };
      } 
      else if (msgType === "audioMessage") {
        toSend = { audio: buff, ptt: message.quoted.ptt || false };
      } 
      else if (msgType === "stickerMessage") {
        toSend = { sticker: buff };
      } 
      else if (msgType === "documentMessage") {
        toSend = { document: buff, fileName: message.quoted.fileName || "file" };
      } 
      else {
        toSend = { text: message.quoted.text || "" };
      }
    } 
    else {
      toSend = { text: message.quoted.text || "" };
    }

    let success = 0;
    let failed = [];

    for (let jid of validJids) {
      try {
        await client.sendMessage(jid, toSend);
        success++;
        await new Promise(r => setTimeout(r, 800)); // Safe delay
      } catch (e) {
        failed.push(jid);
      }
    }

    let report = `✅ *Forward Completed*\n\n📨 Success: ${success}/${validJids.length}`;
    if (failed.length) report += `\n❌ Failed: ${failed.join(", ")}`;

    message.reply(report);

  } catch (e) {
    message.reply("💢 Error: " + e.message);
  }
});
