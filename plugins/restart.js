const { cmd } = require("../command");
const { sleep } = require("../lib/functions");

cmd({
    pattern: "restart",
    react: '🔄',
    desc: "Restart RANUMITHA-X-MD",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { reply, isOwner }) => {
    try {
        if (!isOwner) {
            await conn.sendMessage(m.chat, { react: { text: '🚫', key: mek.key } }); 
            return reply("*🚫 Owner only command!*");
        }

        await conn.sendMessage(m.chat, { react: { text: '✔️', key: mek.key } }); 
        reply("Restarting...");
        await sleep(1500);

        const { exec } = require("child_process");
        exec("pm2 restart all");

    } catch (e) {
        console.error(e);
        reply(`${e}`);
    }
});
