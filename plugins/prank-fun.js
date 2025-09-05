const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "hack",
    desc: "Displays a dynamic and playful 'Hacking' message for fun.",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { 
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply 
}) => {
    try {
        // Get the bot owner's number dynamically from conn.user.id
        const botOwner = conn.user.id.split(":")[0]; // Extract the bot owner's number
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }

        const steps = [
            '💻 *RANUMITHA HACK STARTING...* 💻',
            
            '*Initializing hacking tools...* 🛠️',
            '*Connecting to remote servers...* 🌐',
            
            '```[██████████] 10%``` ⏳'                                            ,
            '```[███████████████████] 20%``` ⏳'                                   ,
            '```[███████████████████████] 30%``` ⏳'                               ,
            '```[██████████████████████████] 40%``` ⏳'                            ,
            '```[███████████████████████████████] 50%``` ⏳'                       ,
            '```[█████████████████████████████████████] 60%``` ⏳'                 ,
            '```[██████████████████████████████████████████] 70%``` ⏳'            ,
            '```[██████████████████████████████████████████████] 80%``` ⏳'        ,
            '```[██████████████████████████████████████████████████] 90%``` ⏳'    ,
            '```[████████████████████████████████████████████████████] 100%``` ✅',
            
            '🔒 *System Breach: Successful!* 🔓',
            '🚀 *Command Execution: Complete!* 🎯',
            
            '*📡 Transmitting data...* 📤',
            '_🕵️‍♂️ Ensuring stealth..._ 🤫',
            '*🔧 Finalizing operations...* 🏁',
            
            '⚠️ *Note:* All actions are for demonstration purposes only.',
            '⚠️ *Reminder:* Ethical hacking is the only way to ensure security.',
            
            '> *RANUMITHA-X-MD-HACKING-COMPLETE ☣*'
        ];

        for (const line of steps) {
            await conn.sendMessage(from, { text: line }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay as needed
        }
    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});

cmd({
    pattern: "hack2",
    alias: ["mainhack", "fuckyourdevice", "fuckyoudevice"],
    use: '.prankhack',
    desc: "Prank hacking simulation (extended ~28-step messages).",
    category: "fun",
    react: "💻",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        function makeBar(percent) {
            const totalBlocks = 20;
            const filled = Math.floor((percent / 100) * totalBlocks);
            const empty = totalBlocks - filled;
            return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}% ⏳`;
        }

        const steps = [
            { p: 1,   msg: "👨‍💻 RANUMITHA Hacking started..." },
            { p: 3,   msg: "🔍 Initializing attack vectors..." },
            { p: 6,   msg: "📡 Scanning open ports..." },
            { p: 8,   msg: "🛰️ Mapping target network..." },
            { p: 10,  msg: "🛡️ Firewall bypassed..." },
            { p: 12,  msg: "🔑 Cracking SSH keys..." },
            { p: 15,  msg: "🌐 Connecting to server..." },
            { p: 18,  msg: "📂 Accessing database..." },
            { p: 20,  msg: "💽 Extracting user tables..." },
            { p: 25,  msg: "📊 Reading sensitive data..." },
            { p: 30,  msg: "💾 Dumping database..." },
            { p: 35,  msg: "📡 Uploading payload..." },
            { p: 40,  msg: "⚡ Privilege escalation..." },
            { p: 45,  msg: "🖥️ Root access granted..." },
            { p: 50,  msg: "📂 Accessing data center..." },
            { p: 55,  msg: "🔓 Decrypting secure files..." },
            { p: 60,  msg: "🔒 Encrypting stolen archive..." },
            { p: 65,  msg: "📦 Packing exfiltrated files..." },
            { p: 70,  msg: "📡 Uploading to remote server..." },
            { p: 75,  msg: "📶 Signal boosted for stealth transfer..." },
            { p: 80,  msg: "🧹 Cleaning local traces..." },
            { p: 85,  msg: "📀 Formatting system logs..." },
            { p: 88,  msg: "🔄 Spoofing IP address..." },
            { p: 90,  msg: "🚨 Finalizing exploit..." },
            { p: 93,  msg: "📂 Seeding fake backups..." },
            { p: 96,  msg: "🛰️ Bypassing monitoring tools..." },
            { p: 98,  msg: "🛑 Disconnecting secure channels..." },
            { p: 100, msg: "✅ HACKING COMPLETE — TARGET COMPROMISED!" }
        ];

        const baseDelay = 1000; // ms

        for (let i = 0; i < steps.length; i++) {
            ((step, delay) => {
                setTimeout(async () => {
                    try {
                        const text = `${step.msg}\n${makeBar(step.p)}`;
                        await conn.sendMessage(from, { text }, { quoted: mek });
                    } catch (err) {
                        console.error("Send error:", err);
                    }
                }, delay);
            })(steps[i], i * baseDelay);
        }

    } catch (e) {
        console.error("Error in prankhack command:", e);
        reply(`Error: ${e.message}`);
    }
});
