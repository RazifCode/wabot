const prefix = "!"
const fs = require("fs")

module.exports = async (conn, messages) => {
  const m = messages
  if (!m.message) return
  const jid = m.key.remoteJid
  const text = m.message.extendedTextMessage?.text || m.message.conversation || m.message.imageMessage?.caption || m.message.videoMessage?.caption || ""
  console.log(m)
  const command = text?.slice(prefix.length).trim().split(' ').shift()?.toLowerCase()
  const reply = text => {
    conn.sendMessage(jid, {
      text: text
    }, { quoted: m })
  }
  switch (command) {
    case 'text':
      await reply("hai, ini adalah text")
      break;
      
    case 'tag':
      await conn.sendMessage(jid, {
        mentions: [m.key.participant]
        text: `hai @${m.key.participant.split("@")[0]}`,
      }, { quoted: m })
      break;
    
    case 'poll':
      await conn.sendMessage(jid, {
        poll: {
          name: "my poll",
          values: ["test1", "test2"],
          selectableCount: 1,
          toAnnouncementGroup: false
        }
      }, { quoted: m })
      break;
    
    case 'link':
      await reply("https://github.com/RazifCode/wabot")
      break;
    
    case 'gif':
      await conn.sendMessage(jid, {
        video: fs.readFileSync("./media/video.mp4" ), 
        caption: "ini adalah gif",
        gifPlayback: true
      }, { quoted: m })
      break;
      
    case 'viewone':
      await conn.sendMessage(jid, {
        image: fs.readFileSync("./media/image.jpg"), // boleh audio, & video
        caption: "ini adalah viewones",
        viewOnce: true
      }, { quoted: m })
      break;
    
      
    case 'image':
      await conn.sendMessage(jid, {
        image: { url: "https://files.catbox.moe/dqzmyo.jpg" },
        // image: fs.readFileSync("./image.jpg")
        caption: "ini adalah reply image"
      }, { quoted: m })
      break;
      
    case 'video':
      await conn.sendMessage(jid, {
        video: { url: "https://files.catbox.moe/zs0vp1.mp4" },
        caption: "ini adalah reply video"
      }, { quoted: m })
      break;
      
    case 'audio':
      await conn.sendMessage(jid, {
        audio: { url: "https://files.catbox.moe/q4q1s0.mpeg" },
        mimetype: "audio/mpeg", // tergantung nama file/url, (mp3, wav, acc dll)
        ptt: true // true, voice note
      }, { quoted: m })
      break;
    
    case 'sticker':
      await conn.sendMessage(jid, {
        sticker: { url: "https://files.catbox.moe/y0a8tg.webp" },
      }, { quoted: m })
      break;
    
    case 'document':
      await conn.sendMessage(jid, {
        document: { url: "https://files.catbox.moe/dqzmyo.jpg" },
        fileName: "image.jpg",
        mimetype: "image/jpeg" // boleh juga type seperti zip, apk dll tergantung nama file atau url
      }, { quoted: m })
      break;
    
    case 'autoread':
      await conn.readMessages([m.key])
      break;

    case 'emoji':
      await conn.sendMessage(jid, {
        react: {
          text: "🥰",
          key: m.key
        }
      })
      break;
    
    case 'number': // nomor
      await conn.sendMessage(jid, {
        contacts: {
          displayName: "Name",
          contacts: [{
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Name
TEL;type=CELL;type=VOICE;waid=60123456789:+60 12-3456 6789
END:VCARD`
          }]
        }
      }, { quoted: m })
      break;
    /*
    case 'location':
      await conn.sendMessage(jid, {
        location: {
          degreesLatitude: 2.2497,
          degreesLonggitude: 119.10299,
          name: "tongl",
          address: "negeri"
        }
      }, { quoted: m})
      break;
    */ // jarang atau tiada untuk diguna
    case 'delete':
      await conn.sendMessage(jid, {
        delete: {
          remoteJid: jid,
          fromMe: false, // jika nombor lain, false. tapi bot harus jadi admin
          id: m.key.id,
          participant: m.key.participant || jid
        }
      })
      break;
    /*
    case 'button': // test button
      await conn.sendMessage(jid, {
        text: "ini button",
        sections: [{
          title: "menu",
          rows: [
            {
              title: "video 2", rowId: "!video"
            },
            {
              title: "image 3", rowId: "!image"
            }
          ]
        }],
        buttonText: "Klik ni"
      }, { quoted: m })
      break;
    */ // button tidk support dengan baileys original
    
  }
  }
