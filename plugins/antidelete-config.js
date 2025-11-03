const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');


// Anti Delete
cmd({
    on: "message.delete",
}, 
async (conn, mek, m, { from, isOwner }) => {
    try {
        if (config.ANTI_DELETE === 'true') {
            // mek.message.id = delete una message eka
            const deletedMsg = mek.message;
            const participant = mek.key.participant || mek.participant;
            const msgId = mek.key.id;

            // resend deleted message
            if (deletedMsg) {
                await conn.sendMessage(from, { text: `🚫 Message deleted by @${participant.split('@')[0]}`, mentions: [participant] });
                await conn.copyNForward(from, deletedMsg, true);
            }
        }
    } catch (e) {
        console.log("Anti Delete Error:", e);
    }
});
