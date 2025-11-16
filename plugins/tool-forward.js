const { cmd } = require("../command");

// Safety Configuration
const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,
  EXTRA_DELAY: 4000,
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward media/messages to single or multiple JIDs (users, groups, channels)",
  category: "owner",
  filename: __filename
},
async (client, message, match, { isOwner }) => {
  try {
    // ===== Owner Only =====
    if (!isOwner) return await message.reply("📛 *Owner Only Command*");
    // ===== Must reply to a message =====
    if (!message.quoted) return await message.reply("🍁 *Please reply to a message to forward*");

    // ===== JID PROCESSING =====
    let jidInput = "";

    if (typeof match === "string") jidInput = match.trim();
    else if (Array.isArray(match)) jidInput = match.join(" ").trim();
    else if (match && typeof match === "object") jidInput = match.text || "";

    const rawJids = jidInput.split(/[\s,]+/).filter(x => x.trim().length > 0);

    const validJids = rawJids
      .map(jid => {
        let clean = jid.replace(/(@g\.us|@s\.whatsapp\.net|@newsletter)$/i, "");

        if (/^\d+$/.test(clean)) {
          if (jid.includes("@g.us")) return `${clean}@g.us`;                 // Group
          if (jid.includes("@s.whatsapp.net")) return `${clean}@s.whatsapp.net`; // User
          if (jid.includes("@newsletter")) return `${clean}@newsletter`;     // Channel
          // Auto-detect based on length
          if (clean.length > 15) return `${clean}@g.us`;                     // Group-like
          return `${clean}@s.whatsapp.net`;                                  // Default user
        }
        return null;
      })
      .filter(x => x !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0)
      return await message.reply(
        "❌ *No valid JIDs found!*\n\nExamples:\n" +
        ".fwd 120363411055156472@g.us\n" +
        ".fwd 94713119712@s.whatsapp.net\n" +
        ".fwd 120363405042997613@newsletter\n" +
        ".fwd 1203xxxxxxx 1203yyyyyyy"
      );

    // ===== MESSAGE TYPE =====
    let messageContent = {};
    const q = message.quoted;
    const mtype = q.mtype;

    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mtype)) {
      const buffer = await q.download();
      switch (mtype) {
        case "imageMessage":
          messageContent = { image: buffer, caption: q.text || "" };
          break;
        case "videoMessage":
          messageContent = { video: buffer, caption: q.text || "" };
          break;
        case "audioMessage":
          messageContent = { audio: buffer, ptt: q.ptt || false };
          break;
        case "stickerMessage":
          messageContent = { sticker: buffer };
          break;
        case "documentMessage":
          messageContent = { document: buffer, fileName: q.fileName || "file" };
          break;
      }
    } else if (mtype === "extendedTextMessage" || mtype === "conversation") {
      messageContent = { text: q.text };
    } else {
      messageContent = q;
    }

    // ===== SENDING PROCESS =====
    let successCount = 0;
    const failed = [];

    for (let i = 0; i < validJids.length; i++) {
      const jid = validJids[i];
      try {
        await client.sendMessage(jid, messageContent);
        successCount++;

        if ((i + 1) % 10 === 0) {
          await message.reply(`🔄 Sent to ${i + 1}/${validJids.length}...`);
        }

        const delay = (i + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(res => setTimeout(res, delay));

      } catch {
        failed.push(jid);
        await new Promise(res => setTimeout(res, SAFETY.BASE_DELAY));
      }
    }

    // ===== REPORT =====
    let report = `✅ *Forwarding Completed*\n\n` +
                 `📤 Success: ${successCount}/${validJids.length}\n` +
                 `📦 Type: ${mtype || "text"}\n`;

    if (failed.length > 0) report += `\n❌ Failed: ${failed.join(", ")}`;

    await message.reply(report);

  } catch (e) {
    await message.reply("💢 Error: " + e.message);
  }
});
