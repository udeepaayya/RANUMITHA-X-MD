const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

// Fixed allowed number
const SPECIAL_ALLOWED = "94713119712";

cmd({
    pattern: "get",
    alias: ["source", "js" , "getplugin" , "getplugins"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, isOwner }) => {
    try {
        
        // Extract number without domain
        const senderNum = m.sender.replace("@s.whatsapp.net", "").replace("+", "");

        // ALLOW ONLY: isOwner OR 94713119712
        if (!isOwner && senderNum !== SPECIAL_ALLOWED) {
            return reply("❌ You are not allowed to use this command!");
        }

        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get alive`");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => 
            cmd.pattern === commandName || 
            (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!commandData) return reply("❌ Command not found!");

        const fullCode = fs.readFileSync(commandData.filename, 'utf-8');

        let truncatedCode = fullCode;
        if (truncatedCode.length > 4000) {
            truncatedCode = truncatedCode.substring(0, 4000) + "\n\n// Code too long, sending full file 📂";
        }

        const formattedCode = `⬤───〔 *📜 Command Source* 〕───⬤
\`\`\`js
${truncatedCode}
\`\`\`
╰──────────⊷  
⚡ Full file sent below 📂  
Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        await conn.sendMessage(from, { 
            text: formattedCode
        });

        const fileName = `${commandName}.js`;
        const tempPath = path.join(__dirname, fileName);

        fs.writeFileSync(tempPath, fullCode);

        await conn.sendMessage(from, { 
            document: fs.readFileSync(tempPath),
            mimetype: 'text/javascript',
            fileName: fileName
        });

        fs.unlinkSync(tempPath);

    } catch (e) {
        console.error("GET CMD ERROR:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
