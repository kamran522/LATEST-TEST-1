const {
  Console
} = require("console");
(async function Sparky() {
  const {
    makeWASocket: _0x1c3567,
    useMultiFileAuthState: _0xb8f787,
    DisconnectReason: _0x5e164b,
    Browsers: _0x4effa4,
    makeInMemoryStore: _0x157992,
    makeCacheableSignalKeyStore: _0x862c8e,
    fetchLatestBaileysVersion: _0x22bcc4
  } = require("baileys");
  const {
    default: _0x20db66
  } = require("axios");
  const _0x25214d = require("node-cron");
  const {
    Boom: _0x3dc918
  } = require("@hapi/boom");
  const _0x26a43d = require("pino");
  const _0x14500f = require("fs");
  const _0x274d54 = require("path");
  const {
    serialize: _0x41277a,
    commands: _0x3b1092,
    whatsappAutomation: _0x40b83b,
    callAutomation: _0x1447d7,
    externalPlugins: _0x5388bc
  } = require("./lib");
  const _0x40480d = require("./config");
  const _0x2aba30 = _0x7e38f8 => new Promise(_0x11d4b4 => setTimeout(_0x11d4b4, _0x7e38f8));
  const _0x205293 = require("express");
  const _0x407d39 = require("http");
  const _0x264cf0 = _0x205293();
  const _0x1a8f9a = process.env.PORT || 8000;
  const _0x3fdab0 = require("node-cache");
  const _0x4d8f65 = new _0x3fdab0({
    stdTTL: 3600,
    checkperiod: 600,
    useClones: false,
    deleteOnExpire: true,
    maxKeys: 500
  });
  const _0x4fe38b = _0x26a43d({
    level: "silent"
  });
  let _0x2370f0 = process.env.PWD?.includes("userland") ? "LINUX" : process.env.PITCHER_API_BASE_URL?.includes("codesandbox") ? "CODESANDBOX" : process.env.REPLIT_USER ? "REPLIT" : process.env.AWS_REGION ? "AWS" : process.env.TERMUX_VERSION ? "TERMUX" : process.env.DYNO ? "HEROKU" : process.env.KOYEB_APP_ID ? "KOYEB" : process.env.GITHUB_SERVER_URL ? "GITHUB" : process.env.RENDER ? "RENDER" : process.env.RAILWAY_SERVICE_NAME ? "RAILWAY" : process.env.VERCEL ? "VERCEL" : process.env.DIGITALOCEAN_APP_NAME ? "DIGITALOCEAN" : process.env.AZURE_HTTP_FUNCTIONS ? "AZURE" : process.env.NETLIFY ? "NETLIFY" : process.env.FLY_IO ? "FLY_IO" : process.env.CF_PAGES ? "CLOUDFLARE" : process.env.SPACE_ID ? "HUGGINGFACE" : "VPS";
  if (_0x2370f0 === "KOYEB" || _0x2370f0 === "RENDER") {
    let _0x11a532 = "";
    _0x264cf0.get("/", function (_0x1e6c7e, _0x3e14a4) {
      if (!_0x11a532) {
        _0x11a532 = _0x1e6c7e.protocol + "://" + _0x1e6c7e.get("host");
        console.log("Detected Deployed URL:", _0x11a532);
      }
      _0x3e14a4.send({
        status: "Active",
        deployedUrl: _0x11a532
      });
    });
    console.log("web Starting...");
    async function _0x339031() {
      if (!_0x11a532) {
        console.log("Deployed URL is not yet set.");
        return;
      }
      try {
        const _0x4935cf = await _0x20db66.get(_0x11a532);
        console.log("Successfully visited " + _0x11a532 + " - Status code: " + _0x4935cf.status);
      } catch (_0x1e4d4d) {
        console.error("Error visiting " + _0x11a532 + ":", _0x1e4d4d);
      }
    }
    const _0x467b3b = _0x407d39.createServer(_0x264cf0);
    _0x467b3b.listen(_0x1a8f9a, () => {
      console.log("Connected to Server -- ", _0x1a8f9a);
      _0x25214d.schedule("*/10 * * * * *", _0x339031);
    });
  }
  console.log("Running on platform: " + _0x2370f0);
  if (!_0x14500f.existsSync("./lib/session")) {
    _0x14500f.mkdirSync("./lib/session", {
      recursive: true,
      mode: 0o700
    });
  }
  try {
    const {
      state: _0x26d13,
      saveCreds: _0x3839d1
    } = await _0xb8f787("./lib/session");
    if (!_0x26d13.creds.registered) {
      console.error("No paired WhatsApp session found. Run `node pair.js` once to link your number locally, then start the bot again.");
      process.exit(1);
    }
    try {
      _0x14500f.chmodSync("./lib/session", 0o700);
      _0x14500f.readdirSync("./lib/session").forEach(_0x1f => _0x14500f.chmodSync("./lib/session/" + _0x1f, 0o600));
    } catch (_e) {}
    const {
      version: _0x50250a
    } = await _0x22bcc4();
    const _0x55b8e5 = _0x1c3567({
      auth: {
        creds: _0x26d13.creds,
        keys: _0x862c8e(_0x26d13.keys, _0x4fe38b)
      },
      downloadHistory: false,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
      printQRInTerminal: false,
      version: _0x50250a,
      logger: _0x4fe38b,
      getMessage: false,
      cachedGroupMetadata: async _0x292311 => _0x4d8f65.get(_0x292311)
    });
    try {
      await _0x40480d.DATABASE.sync;
      console.log("Database synced.");
    } catch (_0x54cbd8) {
      console.error("Error while syncing database:", _0x54cbd8);
    }
    async function _0x19b4db() {
      try {
        let _0x534d92 = await _0x5388bc.findAll();
        _0x534d92.map(async _0x18928a => {
          if (!_0x14500f.existsSync("./plugins/" + _0x18928a.dataValues.name + ".js")) {
            var _0x2e3d43 = await _0x20db66.get(_0x18928a.dataValues.url);
            if (_0x2e3d43.status == 200) {
              console.log("Installing external plugins...");
              _0x14500f.writeFileSync("./plugins/" + _0x18928a.dataValues.name + ".js", _0x2e3d43.data);
              require("./plugins/" + _0x18928a.dataValues.name + ".js");
              console.log("External plugins loaded successfully.");
            }
          }
        });
      } catch (_0x4e6c19) {
        console.log(_0x4e6c19);
      }
    }
    _0x55b8e5.ev.on("connection.update", async ({
      connection: _0x4f7768,
      lastDisconnect: _0x8e4c6
    }) => {
      if (_0x4f7768 === "connecting") {
        console.log("Connecting...");
      } else if (_0x4f7768 === "open") {
        await _0x19b4db();
        console.log("Connected.");
        _0x14500f.readdirSync("./plugins").filter(_0x462a1a => _0x274d54.extname(_0x462a1a) === ".js").forEach(_0x406e9a => require("./plugins/" + _0x406e9a));
        var _0x52f7b6 = "*X BOT MD STARTED!*\n\n_Mode: " + _0x40480d.WORK_TYPE + "_\n_Prefix: " + _0x40480d.HANDLERS + "_\n_Version: " + _0x40480d.VERSION + "_\n_Menu Type: " + _0x40480d.MENU_TYPE + "_\n_Language: " + _0x40480d.LANGUAGE + "_\n\n*Extra Configurations*\n\n```Always online: " + (_0x40480d.ALWAYS_ONLINE ? "✅" : "❌") + "\nAuto status view: " + (_0x40480d.AUTO_STATUS_VIEW ? "✅" : "❌") + "\nAuto reject calls: " + (_0x40480d.REJECT_CALLS ? "✅" : "❌") + "\nAuto read messages: " + (_0x40480d.READ_MESSAGES ? "✅" : "❌") + "\nAuto call blocker: " + (_0x40480d.CALL_BLOCK ? "✅" : "❌") + "\nAuto status save: " + (_0x40480d.SAVE_STATUS ? "✅" : "❌") + "\nAuto status reply: " + (_0x40480d.STATUS_REPLY ? "✅" : "❌") + "\nAuto status reaction: " + (_0x40480d.STATUS_REACTION ? "✅" : "❌") + "\nLogs: " + (_0x40480d.LOGS ? "✅" : "❌") + "\nPM Blocker: " + (_0x40480d.PM_BLOCK ? "✅" : "❌") + "\nPM Disabler: " + (_0x40480d.DISABLE_PM ? "✅" : "❌") + "```";
        var _0x4657fa = (_0x40480d.SUDO !== "" ? _0x40480d.SUDO.split(",")[0] : _0x55b8e5.user.id.split(":")[0]) + "@s.whatsapp.net";
        if (_0x40480d.START_MSG) {
          return await _0x55b8e5.sendMessage(_0x4657fa, {
            text: _0x52f7b6,
            contextInfo: {
              externalAdReply: {
                title: "X BOT MD UPDATES ",
                body: "Whatsapp Channel",
                sourceUrl: "https://whatsapp.com/channel/",
                mediaUrl: "https://whatsapp.com/channel/",
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: true,
                thumbnailUrl: "https://i.imgur.com/Q2UNwXR.jpg"
              }
            }
          }, {
            quoted: false
          });
        }
      } else if (_0x4f7768 === "close") {
        const _0x1ca5f7 = new _0x3dc918(_0x8e4c6?.error)?.output.statusCode;
        if (_0x1ca5f7 === _0x5e164b.loggedOut) {
          console.error("WhatsApp session was logged out. Delete ./lib/session and run `node pair.js` again.");
          process.exit(1);
        } else if (_0x1ca5f7 === _0x5e164b.connectionReplaced) {
          console.log("Connection replaced. Logout current session first.");
          await _0x55b8e5.logout();
        } else {
          console.log("Reconnecting...");
          await _0x2aba30(3000);
          Sparky();
        }
      }
    });
    _0x55b8e5.ev.on("messages.upsert", async _0xbf2d14 => {
      let _0x582b55;
      try {
        _0x582b55 = await _0x41277a(JSON.parse(JSON.stringify(_0xbf2d14.messages[0])), _0x55b8e5);
      } catch (_0x5518ed) {
        console.error("Error serializing message:", _0x5518ed);
        return;
      }
      await _0x40b83b(_0x55b8e5, _0x582b55, _0xbf2d14);
      if (_0x40480d.DISABLE_PM && !_0x582b55.isGroup) {
        return;
      }
      _0x3b1092.map(async _0x24e88a => {
        if (_0x24e88a.fromMe && !_0x582b55.sudo) {
          return;
        }
        let _0x1563b0 = _0x582b55.text ? _0x582b55.body[0].toLowerCase() + _0x582b55.body.slice(1).trim() : "";
        let _0x5514c7;
        try {
          if (_0x24e88a.on) {
            _0x24e88a.function({
              m: _0x582b55,
              args: _0x582b55.body,
              client: _0x55b8e5
            });
          } else if (_0x24e88a.name && _0x24e88a.name.test(_0x1563b0)) {
            _0x5514c7 = _0x582b55.body.replace(_0x24e88a.name, "$1").trim();
            _0x24e88a.function({
              m: _0x582b55,
              args: _0x5514c7,
              client: _0x55b8e5
            });
          }
        } catch (_0x461de3) {
          console.log(_0x461de3);
        }
      });
    });
    _0x55b8e5.ev.on("creds.update", async () => {
      await _0x3839d1();
      try {
        _0x14500f.readdirSync("./lib/session").forEach(_0x1f => _0x14500f.chmodSync("./lib/session/" + _0x1f, 0o600));
      } catch (_e) {}
    });
    _0x55b8e5.ev.on("call", async _0x358d65 => {
      for (let _0x5ce9e2 of _0x358d65) {
        await _0x1447d7(_0x55b8e5, _0x5ce9e2);
      }
    });
  } catch (_0x2cd161) {
    console.error("Error:", _0x2cd161.message);
    await _0x2aba30(3000);
    Sparky();
  }
})();
