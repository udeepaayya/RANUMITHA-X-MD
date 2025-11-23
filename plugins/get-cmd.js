const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

// Allowed numbers
const ALLOWED_NUMBERS = ["94762094304@s.whatsapp.net", "94713119712@s.whatsapp.net"];

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
        // Only allow specific numbers
        if (!ALLOWED_NUMBERS.includes(m.sender)) {
            return reply("❌ You are not allowed to use this command!");
        }

        if (!args[0]) return reply("❌ Please provide a command name. Example: `.get alive`");

        const commandName = args[0].toLowerCase();
        const commandData = commands.find(cmd => 
            cmd.pattern === commandName || 
            (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!commandData) return reply("❌ Command not found!");

        // Get the command file path
        const commandPath = commandData.filename;

        // Read full source code
        const fullCode = fs.readFileSync(commandPath, 'utf-8');

        // Truncate if too long
        let truncatedCode = fullCode;
        if (truncatedCode.length > 4000) {
            truncatedCode = fullCode.substring(0, 4000) + "\n\n// Code too long, sending full file 📂";
        }

        const formattedCode = `⬤───〔 *📜 Command Source* 〕───⬤
\`\`\`js
${truncatedCode}
\`\`\`
╰──────────⊷  
⚡ Full file sent below 📂  
Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        // Send image with preview
        await conn.sendMessage(from, { 
            image: { url: `https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_Green.jpg` },
            caption: formattedCode,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: false,
            }
        }, { quoted: fakevCard });

        // Create temp file and send full code
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
        console.error("Error in .get command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
