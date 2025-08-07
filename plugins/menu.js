const { cmd, commands } = require("../command");
const config = require('../config');
const os = require("os");
const { runtime } = require('../lib/functions');

// Fake ChatGPT vCard
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
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};

cmd(
  {
    pattern: "menu",
    alise: ["getmenu","list,ranulist"],
    react: "📂",
    desc: "get cmd list",
    category: "main",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      let menu = {
        main: "",
        download: "",
        group: "",
        owner: "",
        convert: "",
        search: "",
      };

      for (let i = 0; i < commands.length; i++) {
        if (commands[i].pattern && !commands[i].dontAddCommandList) {
          menu[
            commands[i].category
          ] += `${config.PREFIX}${commands[i].pattern}\n`;
        }
      }

let madeMenu = `👋 *ʜᴇʟʟᴏ* ${pushname}

*╭─「 MENU 」*
*│* 🐼 *Bot*: *𝐑𝐀𝐍𝐔𝐌𝐈𝐓𝐇𝐀-𝐗-𝐌𝐃*
*│* 👤 *User*: ${pushname}
*│* 🤵‍♂ Owner: *ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴᴬ*
*│* ⏰ Uptime: ${runtime(process.uptime())}
*│* ⏳ Ram: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
*│* 🖊️ Prefix: .
╰──────────●●► 

👾 Ξ *MAIN COMMANDS:* Ξ
        ▫️.alive
        ▫️.menu
        ▫️.ai <text>
        ▫️.system
        ▫️.owner
📥 Ξ *DOWNLOAD COMMANDS:* Ξ
        ▫️.song <text>
        ▫️.video <text>
        ▫️.fb <link>
        ▫️.tt <link>
        ▫️.ss <link>
        ▫️.mediafire <link>
        ▫️.apk <link>
🫧 Ξ *GROUP COMMANDS:* Ξ
        ▫️.join <G link>
        ▫️.kick <reply msg>
        ▫️.add <user nub>
        ▫️.mute <group Inside>
        ▫️.unmute <group Inside>
${menu.group}👨‍💻 Ξ *OWNER COMMANDS:* Ξ
        ▫️.shutdown
        ▫️.restart
        ▫️.update
        ▫️.resetdb
🧚 Ξ *CONVERT COMMANDS:* Ξ
        ▫️.sticker <reply img>
        ▫️.img <reply sticker>
        ▫️.url <img/video/audio>
        ▫️.tts <text>
${menu.search}
> 𝐏𝐨𝐰𝐞𝐫𝐝 𝐛𝐲 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 💎
`;
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/IMG-20250711-WA0010.jpg",
          },
          caption: madeMenu,
        },
        { quoted: fakevCard }
      );
    } catch (e) {
      console.log(e);
      reply(`${e}`);
    }
  }
);
