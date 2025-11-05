const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');
const config = require('../config');
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

cmd({
    pattern: "antidelete",
    alias: ["setantidelete"],
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
