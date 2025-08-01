const {cmd , commands} = require('../command')
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["hyranu","ranu"],
    react: "🌝",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async(robin, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    await robin.sendPresenceUpdate('recording', from);
    await robin.sendMessage(from, { audio: { url: "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/Amor%20Na%20Praia%20(Slowed)%20edited.mp3" }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
return await robin.sendMessage(from,{image: {url: config.ALIVE_IMG},caption: config.ALIVE_MSG,Hellow world for intarnational},{quoted: mek})
    
}catch(e){
console.log(e)
reply(`${e}`)
}
})

