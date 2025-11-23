const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

// Allowed raw numbers
const RAW_ALLOWED = ["94762094304", "94713119712"];

// Fake vCard
const fakevCard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

cmd({
    pattern: "get",
    alias: ["source", "js", "getplugin", "getplugins"],
    desc: "Fetch the full source code of a command",
    category: "owner",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {

        // Extract pure number part
        const senderNum = m.sender.replace("@s.whatsapp.net", "");

        // Check permission
        if (!RAW_ALLOWED.includes(senderNum)) {
            return reply("❌ You are not allowed to use this command!");
        }

        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get alive`");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => 
            cmd.pattern === commandName || 
            (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!commandData) return reply("❌ Command not found!");

        // Read full code
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
            image: { url: `https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_Green.jpg` },
            caption: formattedCode
        }, { quoted: fakevCard });

        const fileName = `${commandName}.js`;
        const tempPath = path.join(__dirname, fileName);

        fs.writeFileSync(tempPath, fullCode);

        await conn.sendMessage(from, { 
            document: fs.readFileSync(tempPath),
            mimetype: 'text/javascript',
            fileName: fileName
        }, { quoted: mek });

        fs.unlinkSync(tempPath);

    } catch (e) {
        console.error("GET CMD ERROR:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
