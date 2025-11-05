const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

cmd({
    pattern: "welcome",
    alias: ["welcomeset"],
    desc: "Enable or disable welcome messages for new members",
    category: "settings",
    filename: __filename
},
async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*🚫 Owner Only Command!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_DELETE = "true";
        return reply("✅ Antidelete msg now enabled.");
    } else if (status === "off") {
        config.ANTI_DELETE = "false";
        return reply("❌ Antidelete msg now disabled.");
    } else {
        return reply(`Example: .antidelete on`);
    }
});
