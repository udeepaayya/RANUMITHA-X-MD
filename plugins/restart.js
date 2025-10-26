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
            return reply("*🚫 Owner only command!*");  
        }  

        const { exec } = require("child_process");  
        reply("Restarting...");  
        await sleep(1500);  
        exec("pm2 restart all");  
    } catch (e) {  
        console.error(e);  
        reply(`${e}`);  
    }  
});
