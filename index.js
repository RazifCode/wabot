const {
  default: makeWaSocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const pino = require("pino")
let question = text => {
  let rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise(resolve => {
    rl.question(text, resolve)
  })
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const conn = makeWaSocket({
    auth: state,
    logger: pino({ level: "silent" })
  })
  
  conn.ev.on("creds.update", saveCreds)
  conn.ev.on("connection.update", async update => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      const waNumber = await question("start with your number: ")
      const code = await conn.requestPairingCode(waNumber)
      console.log(code)
      // qrcode.generate(qr, {small: true })
    }
    if (connection == "close") {
      console.log("close, restart bot")
      await console.log(lastDisconnect)
      startBot()
    }
    if (connection == "open") {
      console.log("connect bot: +" + conn.user.id)
    }
  })

  conn.ev.on("messages.upsert", ({ messages }) => require("./messages.js")(conn, messages[0]))
}
startBot()
