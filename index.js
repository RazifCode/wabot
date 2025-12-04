// config
prefixes = ["!", "#", "/", ".", ""]; // Array awalan yang dibenarkan
ownerNumber = ""; // nombormu
ownerNumberAlt = ""; // nombor lid
botNumber = ""; // nombot bot

// kalau mau pindah ke file config. anda boleh buat file baru (config.js) lalu tambahkan ini
// require(config.js)

// disini untuk bot
const {
    default: makeWaSocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidDecode
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const { Low, JSONFile } = require("lowdb");
const chalk = require("chalk");
const inquirer = require("inquirer");

let question = text => {
    let rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(text, resolve);
    });
};

db = new Low(new JSONFile("database.json"));
loadDatabase = async function loadDatabase() {
    if (db.READ) {
        return new Promise(resolve => {
            setInterval(function () {
                !db.READ
                    ? (clearInterval(conn),
                      resolve(db.data == null ? loadDatabase() : db.data))
                    : null;
            }, 1 * 1000);
        });
    }
    if (db.data !== null) return;
    await db.read();
    db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(db.data || {})
    };
    db.chain = require("lodash").chain(db.data);
};
loadDatabase();

if (db && db.data) {
    db.write();
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const conn = makeWaSocket({
        auth: state,
        logger: pino({ level: "silent" })
    });

    // ev
    conn.ev.on("creds.update", saveCreds);
    conn.ev.on("connection.update", async update => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            try {
                // Logik QR Code/Pairing Code
                const { request } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "request",
                        message: "Ingin menggunakan login method?",
                        choices: [
                            { name: "QrCode", value: "qr" },
                            { name: "PairingCode", value: "pairing" }
                        ]
                    }
                ]);

                if (request == "qr") {
                    console.log(chalk.cyan("\nScan QR dibawah"));
                    require("qrcode-terminal").generate(qr, { small: true });
                }
                if (request == "pairing") {
                    const { waNumber } = await inquirer.prompt([
                        {
                            type: "input",
                            name: "waNumber",
                            message: chalk.blue(
                                "Masukkan nombor whatsapp anda:"
                            ),
                            validate: input => {
                                if (!/^\d+$/.test(input)) {
                                    return "Masukkan nombot sahaja";
                                }
                                if (input.length == 0) {
                                    return "Sila masukkan nombor";
                                }
                                if (input.length < 8) {
                                    return "Nombor terlalu pendek";
                                }
                                return true;
                            }
                        }
                    ]);

                    let code = await conn.requestPairingCode(waNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(chalk.cyan("Your Pairing Code : ") + code);
                }
            } catch (err) {
                console.error("error use qr in connection: " + err + "\n\n");
                console.log(
                    chalk.green("use a simple source qrCode\nHere this: \n\n")
                );
                await require("qrcode-terminal").generate(qr, { small: true });
            }
        }
        if (connection == "close") {
            console.log(chalk.cyan("close bott.."));
            startBot();
        }
        if (connection == "open") {
            console.log(chalk.green("connect bot: +" + conn.user.id));
            if (db.data == null) await loadDatabase();
        }
    });

    conn.ev.on("call", async call => require("./conn/call.js")(call));
    conn.ev.on("messages.upsert", chatUpdate => {
        const m = chatUpdate.messages[chatUpdate.messages.length - 1];

        if (!m.message) return;
        console.log(m);
        if (m) db.write();
        m.remoteJid = m.key.remoteJid;
        m.chat = m.remoteJid;
        m.id = m.key.id;
        m.fromMe = m.key.fromMe;
        m.messageTimestamp = m.messageTimestamp;
        m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
        m.sender = m.key.fromMe
            ? m.key.remoteJid === "status@broadcast"
                ? ownerJid
                : m.key.remoteJid
            : m.key.participant || m.key.remoteJid;
        m.sender2 = m.key.fromMe
            ? m.key.remoteJid === "status@broadcast"
                ? ownerJid
                : m.key.remoteJid
            : m.key.participantAlt || m.key.remoteJidAlt;
        m.isOwner =
            m.sender == `${ownerNumberAlt}@lid`
                ? true
                : false || m.sender2 == `${ownerNumber}@s.whatsapp.net`
                ? true
                : false;
        m.isBot = m.sender == `${botNumber}@s.whatsapp.net` ? true : false;
        m.pushName = m.pushName;
        m.msgType = Object.keys(m.message)[0];
        m.isGroup = m.chat.endsWith("@g.us");

        // Pemboleh Ubah Tambahan
        const isNumber = x => typeof x === "number" && !isNaN(x);

        // Pemprosesan DB (Menggunakan db)
        try {
            const user = db.data.users[m.sender];
            if (typeof user !== "object" || user === null)
                db.data.users[m.sender] = {};

            const chats = db.data.chats[m.chat];
            if (typeof chats !== "object" || chats === null)
                db.data.chats[m.chat] = {};

            // Inisialisasi User
            if (user) {
                if (!isNumber(user.afkTime)) user.afkTime = -1;
                if (!("afkReason" in user)) user.afkReason = "";
                if (!("premium" in user)) user.premium = false;
            } else
                db.data.users[m.sender] = {
                    afkTime: -1,
                    afkReason: "",
                    premium: false
                };

            // Inisialisasi Chats
            if (chats) {
                if (!("welcome" in chats)) chats.welcome = false;
                if (!("antilink" in chats)) chats.antilink = false;
            } else {
                db.data.chats[m.chat] = {
                    welcome: false,
                    antilink: false
                };
            }

            // Inisialisasi Settings
            const setting = db.data.settings[conn.user.id];
            if (typeof setting !== "object" || setting === null)
                db.data.settings[conn.user.id] = {};
            if (setting) {
                if (!("anticall" in setting)) setting.anticall = false;
                if (!("autobio" in setting)) setting.autobio = false; // Contoh tambahan
            } else
                db.data.settings[conn.user.id] = {
                    anticall: true,
                    autobio: false // Contoh tambahan
                };
        } catch (err) {
            console.error("DB Error: ", err);
        }

        // Pengekstrakan Badan Mesej
        m.body =
            m.message.extendedTextMessage?.text ||
            m.message.conversation ||
            m.message.imageMessage?.caption ||
            m.message.videoMessage?.caption ||
            m.message.stickerMessage?.caption ||
            m.message.templateButtonReplyMessage?.selectedId || // Sokongan Butang
            m.message.listResponseMessage?.singleSelectReply?.selectedRowId || // Sokongan Senarai
            "";

        m.text = m.body;

        // Pengekstrakan Media dan Kuotasi (Pembetulan Ejaan)
        m.ismedia =
            m.msgType.includes("Image") ||
            m.msgType.includes("Video") ||
            m.msgType.includes("Audio") ||
            m.msgType.includes("Sticker");
        m.mime = (m.message[m.msgType] || {}).mimetype || "";
        m.isSticker = m.mime.includes("sticker");
        m.size = (m.message[m.msgType] || {}).fileLength || 0;

        m.mentionedJid =
            m.message.extendedTextMessage?.contextInfo?.mentionedJid || []; // Pembetulan Ejaan

        m.quoted =
            m.msgType === "extendedTextMessage" && // Pembetulan Ejaan
            m.message.extendedTextMessage.contextInfo?.quotedMessage
                ? {
                      key: {
                          remoteJid: m.remoteJid,
                          fromMe:
                              m.message.extendedTextMessage.contextInfo
                                  .participant === m.sender,
                          id: m.message.extendedTextMessage.contextInfo
                              .stanzaId,
                          participant:
                              m.message.extendedTextMessage.contextInfo
                                  .participant
                      },
                      message:
                          m.message.extendedTextMessage.contextInfo
                              .quotedMessage // Pembetulan Ejaan
                  }
                : null;

        // Pemprosesan Perintah (Menggunakan prefixes)
        const usedPrefix = prefixes.find(p => m.body?.startsWith(p));

        const command = m.body
            .slice(usedPrefix ? usedPrefix.length : 0)
            .trim()
            .split(" ")
            .shift()
            ?.toLowerCase();

        m.isCmd = m.body.startsWith(usedPrefix) && !m.isBaileys;

        const fstatus = {
            key: {
                participants: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                fromMe: false,
                id: "halo"
            },
            message: m.text,
            participant: "0@s.whatsapp.net"
        };

        const reply = text => {
            conn.sendMessage(
                m.chat,
                { text: text, mentions: [m.sender] },
                { quoted: fkontak } // opsional: guna "m" atau "fstatus"
            );
        };

        switch (command) {
            case "ping":
                reply("Pong!");
                break;
            case "menu":
                reply("Ini adalah menu.");
                break;
        }
    });
}
startBot();
