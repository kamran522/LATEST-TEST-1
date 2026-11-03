/**
 * Local-only WhatsApp pairing.
 *
 *  - Nothing is uploaded anywhere. Credentials are written only to ./lib/session.
 *  - The pairing code is printed to THIS terminal only (never sent over WhatsApp/HTTP).
 *  - Session folder/files are restricted to the current OS user (0700 / 0600).
 *
 * Usage:   node pair.js            (prompts for your number)
 *          PAIR_NUMBER=923XXXXXXXXX node pair.js
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("baileys");

const SESSION_DIR = path.join(__dirname, "lib", "session");
const logger = pino({ level: "silent" });

function lockDown() {
  try {
    fs.chmodSync(SESSION_DIR, 0o700);
    for (const f of fs.readdirSync(SESSION_DIR)) {
      fs.chmodSync(path.join(SESSION_DIR, f), 0o600);
    }
  } catch (_) {}
}

function ask(q) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); res(a); });
  });
}

(async () => {
  fs.mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
  const probe = await useMultiFileAuthState(SESSION_DIR);
  if (probe.state.creds.registered) {
    console.log("This bot is already paired. To re-pair, delete ./lib/session and run again.");
    process.exit(0);
  }

  let number = (process.env.PAIR_NUMBER || "").replace(/[^0-9]/g, "");
  if (!number) {
    number = (await ask("Your WhatsApp number with country code, digits only (e.g. 923XXXXXXXXX): ")).replace(/[^0-9]/g, "");
  }
  if (number.length < 8) {
    console.error("Invalid number.");
    process.exit(1);
  }

  let codeShown = false;
  async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
      version,
      logger,
      printQRInTerminal: false,
      browser: Browsers.ubuntu("Chrome"),
      syncFullHistory: false,
    });

    sock.ev.on("creds.update", async () => { await saveCreds(); lockDown(); });

    let ready = false;
    const readyP = new Promise((res) => {
      sock.ev.on("connection.update", (u) => { if (u.qr && !ready) { ready = true; res(true); } });
      setTimeout(() => res(false), 15000);
    });

    if (!sock.authState.creds.registered && !codeShown) {
      codeShown = true;
      await readyP;
      try {
        const code = await sock.requestPairingCode(number);
        console.log("\n==============================================");
        console.log("  PAIRING CODE:  " + code);
        console.log("==============================================");
        console.log("WhatsApp > Settings > Linked devices > Link a device >");
        console.log("'Link with phone number instead' > enter the code above.");
        console.log("Do NOT share this code with anyone. It expires in about 2 minutes.\n");
      } catch (e) {
        console.error("Could not request a pairing code: " + (e && e.message) + ". Check this machine's internet access and try again.");
        process.exit(1);
      }
    }

    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        lockDown();
        console.log("Paired successfully. Session saved locally in ./lib/session");
        console.log("Now start the bot with: npm start");
        setTimeout(() => process.exit(0), 4000);
      } else if (connection === "close") {
        const status = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if (status === DisconnectReason.loggedOut || status === 401) {
          console.error("Pairing was rejected/logged out. Delete ./lib/session and try again.");
          process.exit(1);
        }
        // 515 (restartRequired) is normal right after pairing succeeds
        start();
      }
    });
  }
  start();
})();
