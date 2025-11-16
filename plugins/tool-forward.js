const { cmd } = require("../command");

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward media/message to inbox + groups",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {

  try {
    if (!isOwner) return message.reply("📛 *Owner Only Command!*");
    if (!message.quoted) return message.reply("📝 *Please reply to a message*");

    let raw = (match || "").toString().trim();
    if (!raw) return message.reply("❌ *Please give JIDs*\nExample: .fwd jid1,jid2");

    // Split JIDs
    let splitJids = raw.split(/[\s,]+/).filter(x => x.trim());
    if (splitJids.length === 0) return message.reply("❌ No valid JIDs found!");

    // Limit to 25
    splitJids = splitJids.slice(0, 25);

    // Convert to valid WhatsApp JIDs
    let validJids = splitJids.map(jid => {
      jid = jid.trim();

      // If inbox number
      if (/^\d{8,15}$/.test(jid)) return `${jid}@s.whatsapp.net`;

      // If group number
      if (/^\d{8,20}@g\.us$/i.test(jid)) return jid;

      // If inbox complete
      if (/^\d{8,15}@s\.whatsapp\.net$/i.test(jid)) return jid;

      return null;
    }).filter(Boolean);

    if (validJids.length === 0) {
      return message.reply("❌ No valid JIDs!");
    }

    // Detect message type
    let msgType = message.quoted.mtype;
    let toSend = {};

    if (message.quoted.download) {
      let buff = await message.quoted.download();

      if (msgType === "imageMessage") {
        toSend = { image: buff, caption: message.quoted.text || "" };
      } else if (msgType === "videoMessage") {
        toSend = { video: buff, caption: message.quoted.text || "" };
      } else if (msgType === "audioMessage") {
        toSend = { audio: buff, ptt: message.quoted.ptt || false };
      } else if (msgType === "stickerMessage") {
        toSend = { sticker: buff };
      } else if (msgType === "documentMessage") {
        toSend = { document: buff, fileName: message.quoted.fileName || "file" };
      } else {
        toSend = { text: message.quoted.text || "" };
      }
    } else {
      toSend = { text: message.quoted.text || "" };
    }

    let success = 0;
    let failed = [];

    for (let jid of validJids) {
      try {
        await client.sendMessage(jid, toSend);
        success++;
        await new Promise(r => setTimeout(r, 1000)); // Safe delay
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
