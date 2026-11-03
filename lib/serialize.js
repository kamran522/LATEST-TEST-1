const {
  getContentType,
  downloadContentFromMessage,
  generateWAMessageFromContent,
  jidDecode,
  generateForwardMessageContent,
  jidNormalizedUser
} = require("baileys");
const {
  fromBuffer
} = require("file-type");
const {
  addExifToWebP,
  imageToWebP,
  videoToWebP,
  isUrl,
  getBuffer
} = require("../plugins/pluginsCore");
const fs = require("fs");
const fetch = require("node-fetch");
const config = require("../config");
const sleep = _0x653424 => new Promise(_0x34cab5 => setTimeout(_0x34cab5, _0x653424));
const decodeJid = _0x10acc6 => {
  if (!_0x10acc6) {
    return _0x10acc6;
  }
  if (/:\d+@/gi.test(_0x10acc6) || _0x10acc6.includes(":")) {
    try {
      const _0x25db74 = jidDecode ? jidDecode(_0x10acc6) : null;
      if (_0x25db74 && _0x25db74.user && _0x25db74.server) {
        return _0x25db74.user + "@" + _0x25db74.server;
      } else {
        return _0x10acc6;
      }
    } catch {
      return _0x10acc6;
    }
  } else {
    return _0x10acc6;
  }
};
async function downloadMedia(_0x1b6b9d, _0x26f473) {
  const _0xd9044f = {
    imageMessage: "image",
    videoMessage: "video",
    stickerMessage: "sticker",
    documentMessage: "document",
    audioMessage: "audio"
  };
  try {
    let _0x197a67 = Object.keys(_0x1b6b9d)[0];
    let _0x98ba8d = _0x1b6b9d;
    if (_0x197a67 === "templateMessage") {
      _0x98ba8d = _0x1b6b9d.templateMessage.hydratedFourRowTemplate;
      _0x197a67 = Object.keys(_0x98ba8d)[0];
    }
    if (_0x197a67 === "interactiveResponseMessage") {
      _0x98ba8d = _0x1b6b9d.interactiveResponseMessage;
      _0x197a67 = Object.keys(_0x98ba8d)[0];
    }
    if (_0x197a67 === "buttonsMessage") {
      _0x98ba8d = _0x1b6b9d.buttonsMessage;
      _0x197a67 = Object.keys(_0x98ba8d)[0];
    }
    const _0x87c554 = await downloadContentFromMessage(_0x98ba8d[_0x197a67], _0xd9044f[_0x197a67]);
    const _0x1f2039 = [];
    for await (const _0x4ce0ed of _0x87c554) {
      _0x1f2039.push(_0x4ce0ed);
    }
    if (_0x26f473) {
      await fs.writeFile(_0x26f473, Buffer.concat(_0x1f2039));
      return _0x26f473;
    } else {
      return Buffer.concat(_0x1f2039);
    }
  } catch (_0x3cd600) {
    console.error("Error in downloadMedia:", _0x3cd600);
    throw _0x3cd600;
  }
}
const isadmin = async (_0x40cbf8, _0x1e02a4, _0x315c7c) => {
  let _0x153291;
  if (_0x1e02a4.endsWith("@s.whatsapp.net")) {
    _0x153291 = "phoneNumber";
  } else {
    _0x153291 = "id";
  }
  const _0x4e5df3 = await _0x315c7c.groupMetadata(_0x40cbf8);
  const _0x4cef8f = _0x4e5df3.participants.find(_0x362263 => _0x362263[_0x153291] === _0x1e02a4);
  return _0x4cef8f?.admin === "admin" || _0x4cef8f?.admin === "superadmin";
};
async function serialize(_0x2f6cbb, _0x30dcfd) {
  if (_0x2f6cbb.key) {
    _0x2f6cbb.id = _0x2f6cbb.key.id;
    _0x2f6cbb.isSelf = _0x2f6cbb.key.fromMe;
    _0x2f6cbb.isGroup = _0x2f6cbb.key.remoteJid.endsWith("@g.us");
    _0x2f6cbb.jid = _0x2f6cbb.isGroup ? _0x2f6cbb.key.remoteJid : _0x2f6cbb.key.remoteJidAlt;
    _0x2f6cbb.user = decodeJid(_0x30dcfd.user && _0x30dcfd.user.id);
    _0x2f6cbb.sender = _0x2f6cbb.isGroup ? _0x2f6cbb.key.participantAlt : _0x2f6cbb.isSelf ? _0x30dcfd.user.id : _0x2f6cbb.jid;
    _0x2f6cbb.isAdmin = _0x45c1bc => {
      return isadmin(_0x2f6cbb.jid, _0x45c1bc, _0x30dcfd);
    };
    _0x2f6cbb.botNumber = _0x30dcfd?.user?.id?.replace(/:[^@]*/, "");
    _0x2f6cbb.botIsAdmin = _0x2f6cbb.isGroup ? await _0x2f6cbb.isAdmin(_0x2f6cbb?.botNumber) : false;
  }
  _0x2f6cbb.prefix = ["false"].includes(config.HANDLERS) ? "" : config.HANDLERS;
  if (_0x2f6cbb.message) {
    _0x2f6cbb.type = await getContentType(_0x2f6cbb.message);
    if (_0x2f6cbb.type === "ephemeralMessage") {
      _0x2f6cbb.message = _0x2f6cbb.message[_0x2f6cbb.type].message;
      const _0x1bb3ad = Object.keys(_0x2f6cbb.message)[0];
      _0x2f6cbb.type = _0x1bb3ad;
      if (_0x1bb3ad === "viewOnceMessage") {
        _0x2f6cbb.message = _0x2f6cbb.message[_0x2f6cbb.type].message;
        _0x2f6cbb.type = await getContentType(_0x2f6cbb.message);
      }
    }
    if (_0x2f6cbb.type === "viewOnceMessage") {
      _0x2f6cbb.message = _0x2f6cbb.message[_0x2f6cbb.type].message;
      _0x2f6cbb.type = await getContentType(_0x2f6cbb.message);
    }
    try {
      _0x2f6cbb.mentions = _0x2f6cbb.message[_0x2f6cbb.type].contextInfo ? _0x2f6cbb.message[_0x2f6cbb.type].contextInfo.mentionedJid || [] : [];
    } catch {
      _0x2f6cbb.mentions = false;
    }
    try {
      const _0x1d1e3b = _0x2f6cbb.message[_0x2f6cbb.type].contextInfo;
      let _0x4b496d;
      if (_0x1d1e3b && _0x1d1e3b.quotedMessage) {
        if (_0x1d1e3b.quotedMessage.ephemeralMessage) {
          _0x4b496d = Object.keys(_0x1d1e3b.quotedMessage.ephemeralMessage.message)[0];
          _0x2f6cbb.quoted = {
            type: _0x4b496d === "viewOnceMessageV2" ? "view_once" : "ephemeral",
            stanzaId: _0x1d1e3b.stanzaId,
            sender: (await jidNormalizedUser(await _0x30dcfd.signalRepository.lidMapping.getPNForLID(_0x1d1e3b.participant))) || _0x1d1e3b.participant || false,
            message: _0x4b496d === "viewOnceMessageV2" ? _0x1d1e3b.quotedMessage.ephemeralMessage.message.viewOnceMessageV2.message : _0x1d1e3b.quotedMessage.ephemeralMessage.message
          };
        } else if (_0x1d1e3b.quotedMessage.viewOnceMessageV2) {
          _0x2f6cbb.quoted = {
            type: "view_once",
            stanzaId: _0x1d1e3b.stanzaId,
            sender: _0x1d1e3b.participant,
            message: _0x1d1e3b.quotedMessage.viewOnceMessageV2.message
          };
        } else if (_0x1d1e3b.quotedMessage.viewOnceMessageV2Extension) {
          _0x2f6cbb.quoted = {
            type: "view_once_audio",
            stanzaId: _0x1d1e3b.stanzaId,
            sender: _0x1d1e3b.participant,
            message: _0x1d1e3b.quotedMessage.viewOnceMessageV2Extension.message
          };
        } else {
          _0x2f6cbb.quoted = {
            type: "normal",
            stanzaId: _0x1d1e3b.stanzaId,
            sender: _0x1d1e3b.participant,
            message: _0x1d1e3b.quotedMessage
          };
        }
        _0x2f6cbb.quoted.isSelf = _0x2f6cbb.quoted.sender === _0x30dcfd.user.id;
        _0x2f6cbb.quoted.mtype = Object.keys(_0x2f6cbb.quoted.message);
        _0x2f6cbb.quoted.text = _0x2f6cbb.quoted.message[_0x2f6cbb.quoted.mtype]?.text || _0x2f6cbb.quoted.message[_0x2f6cbb.quoted.mtype]?.description || _0x2f6cbb.quoted.message[_0x2f6cbb.quoted.mtype]?.caption || _0x2f6cbb.quoted.mtype === "templateButtonReplyMessage" && _0x2f6cbb.quoted.message[_0x2f6cbb.quoted.mtype].hydratedTemplate?.hydratedContentText || _0x2f6cbb.quoted.message[_0x2f6cbb.quoted.mtype] || "";
        _0x2f6cbb.quoted.key = {
          id: _0x2f6cbb.quoted.stanzaId,
          fromMe: _0x2f6cbb.quoted.isSelf,
          remoteJid: _0x2f6cbb.jid
        };
        _0x2f6cbb.quoted.download = _0x589e28 => downloadMedia(_0x2f6cbb.quoted.message, _0x589e28);
      }
    } catch {
      _0x2f6cbb.quoted = null;
    }
    try {
      _0x2f6cbb.text = _0x2f6cbb.message.conversation || _0x2f6cbb.message[_0x2f6cbb.type].text || _0x2f6cbb.message[_0x2f6cbb.type].selectedId;
      _0x2f6cbb.body = _0x2f6cbb.message.conversation || _0x2f6cbb.message[_0x2f6cbb.type].text || _0x2f6cbb.message[_0x2f6cbb.type].caption || _0x2f6cbb.type === "listResponseMessage" && _0x2f6cbb.message[_0x2f6cbb.type].singleSelectReply.selectedRowId || _0x2f6cbb.type === "buttonsResponseMessage" && _0x2f6cbb.message[_0x2f6cbb.type].selectedButtonId && _0x2f6cbb.message[_0x2f6cbb.type].selectedButtonId || _0x2f6cbb.type === "templateButtonReplyMessage" && _0x2f6cbb.message[_0x2f6cbb.type].selectedId || false;
    } catch {
      _0x2f6cbb.body = false;
    }
    const _0x2cbd52 = config.SUDO.split(",").map(x => x.trim()).filter(Boolean);
    _0x2f6cbb.sudo = _0x2cbd52.includes(_0x2f6cbb?.sender?.split("@")[0]) || _0x2f6cbb?.isSelf;
    _0x2f6cbb.formatNumberToJid = async _0x208e30 => {
      return _0x208e30.replace(/\s+/g, "").replace(/^[+@]/, "") + "@s.whatsapp.net";
    };
    _0x2f6cbb.downloadAndSaveMedia = async (_0xffe772, _0x272d17, _0x22513c = true) => {
      let _0x163088 = _0xffe772.message ? _0xffe772.message : _0xffe772;
      let _0x42e6c2 = (_0xffe772.message || _0xffe772).mimetype || "";
      let _0x277ec4 = _0xffe772.mtype ? _0xffe772.mtype.replace(/Message/gi, "") : _0x42e6c2.split("/")[0];
      const _0x356076 = await downloadContentFromMessage(_0x163088, _0x277ec4);
      let _0x4afeb8 = Buffer.from([]);
      for await (const _0x595e02 of _0x356076) {
        _0x4afeb8 = Buffer.concat([_0x4afeb8, _0x595e02]);
      }
      let _0x5e56c6 = await fromBuffer(_0x4afeb8);
      let _0x4bed2c = _0x22513c ? _0x272d17 + "." + _0x5e56c6.ext : _0x272d17;
      await fs.writeFileSync(_0x4bed2c, _0x4afeb8);
      return _0x4bed2c;
    };
    _0x2f6cbb.runtime = async () => {
      seconds = Number("" + process.uptime());
      var _0x4db6f3 = Math.floor(seconds / 86400);
      var _0x17ebc2 = Math.floor(seconds % 86400 / 3600);
      var _0xa93c00 = Math.floor(seconds % 3600 / 60);
      var _0x1628a3 = Math.floor(seconds % 60);
      var _0x78e87 = _0x4db6f3 > 0 ? _0x4db6f3 + (_0x4db6f3 == 1 ? " day, " : " days, ") : "";
      var _0x35df35 = _0x17ebc2 > 0 ? _0x17ebc2 + (_0x17ebc2 == 1 ? " hour, " : " hours, ") : "";
      var _0x1bf2aa = _0xa93c00 > 0 ? _0xa93c00 + (_0xa93c00 == 1 ? " minute, " : " minutes, ") : "";
      var _0x1d6bda = _0x1628a3 > 0 ? _0x1628a3 + (_0x1628a3 == 1 ? " second" : " seconds") : "";
      return _0x78e87 + _0x35df35 + _0x1bf2aa + _0x1d6bda;
    };
    _0x2f6cbb.uptime = async () => {
      const _0xff4a10 = process.uptime();
      const _0x33b607 = Math.floor(_0xff4a10 % 60);
      const _0x291b7c = Math.floor(_0xff4a10 / 60 % 60);
      const _0x2659cb = Math.floor(_0xff4a10 / 3600 % 24);
      const _0x35abef = _0x2659cb.toString().padStart(2, "0") + ":" + _0x291b7c.toString().padStart(2, "0") + ":" + _0x33b607.toString().padStart(2, "0");
      return _0x35abef;
    };
    _0x2f6cbb.getFile = async (_0x1ddf12, _0x47921e) => {
      let _0x24ad5b;
      let _0x82e3f5;
      let _0x1412e2 = Buffer.isBuffer(_0x1ddf12) ? _0x1ddf12 : /^data:.*?\/.*?;base64,/i.test(_0x1ddf12) ? Buffer.from(_0x1ddf12.split`,`[1], "base64") : /^https?:\/\//.test(_0x1ddf12) ? await getBuffer(_0x1ddf12).catch(async () => (await fetch(_0x1ddf12)).buffer()) : fs.existsSync(_0x1ddf12) ? (_0x82e3f5 = _0x1ddf12, fs.readFileSync(_0x1ddf12)) : typeof _0x1ddf12 === "string" ? _0x1ddf12 : Buffer.alloc(0);
      if (!Buffer.isBuffer(_0x1412e2)) {
        throw console.log("Result is not a buffer");
      }
      let _0x200ab8 = (await fromBuffer(_0x1412e2)) || {
        mime: "application/octet-stream",
        ext: ".bin"
      };
      if (_0x1412e2 && _0x47921e && !_0x82e3f5) {
        _0x82e3f5 = path.join(__dirname, "../" + new Date() * 1 + "." + _0x200ab8.ext);
        await fs.promises.writeFile(_0x82e3f5, _0x1412e2);
      }
      return {
        res: _0x24ad5b,
        filename: _0x82e3f5,
        ..._0x200ab8,
        data: _0x1412e2
      };
    };
    _0x2f6cbb.sendFile = async (_0x3b82a6, _0x13b82b = {}) => {
      let {
        data: _0x18274b
      } = await _0x2f6cbb.getFile(_0x3b82a6);
      let _0x3e40d6 = await fromBuffer(_0x18274b);
      return _0x30dcfd.sendMessage(_0x2f6cbb.jid, {
        [_0x3e40d6.mime.split("/")[0]]: _0x18274b,
        ..._0x13b82b
      }, {
        ..._0x13b82b
      });
    };
    _0x2f6cbb.forwardMessage = async (_0x4bc966, _0x12f905, _0x16838e = {}) => {
      let _0x11e67e;
      let _0x1cb4f2 = _0x12f905;
      if (_0x16838e.readViewOnce) {
        _0x1cb4f2 = _0x1cb4f2 && _0x1cb4f2.ephemeralMessage && _0x1cb4f2.ephemeralMessage.message ? _0x1cb4f2.ephemeralMessage.message : _0x1cb4f2 || undefined;
        const _0x52db37 = Object.keys(_0x1cb4f2)[0];
        delete (_0x1cb4f2 && _0x1cb4f2.ignore ? _0x1cb4f2.ignore : _0x1cb4f2 || undefined);
        delete _0x1cb4f2.viewOnceMessage.message[_0x52db37].viewOnce;
        _0x1cb4f2 = {
          ..._0x1cb4f2.viewOnceMessage.message
        };
      }
      if (_0x16838e.mentions) {
        _0x1cb4f2[_0x11e67e].contextInfo.mentionedJid = _0x16838e.mentions;
      }
      const _0x346d24 = await generateForwardMessageContent(_0x1cb4f2, false);
      _0x11e67e = await getContentType(_0x346d24);
      if (_0x16838e.ptt) {
        _0x346d24[_0x11e67e].ptt = _0x16838e.ptt;
      }
      if (_0x16838e.audiowave) {
        _0x346d24[_0x11e67e].waveform = _0x16838e.audiowave;
      }
      if (_0x16838e.seconds) {
        _0x346d24[_0x11e67e].seconds = _0x16838e.seconds;
      }
      if (_0x16838e.fileLength) {
        _0x346d24[_0x11e67e].fileLength = _0x16838e.fileLength;
      }
      if (_0x16838e.caption) {
        _0x346d24[_0x11e67e].caption = _0x16838e.caption;
      }
      if (_0x16838e.contextInfo) {
        _0x346d24[_0x11e67e].contextInfo = _0x16838e.contextInfo;
      }
      if (_0x16838e.mentions) {
        _0x346d24[_0x11e67e].contextInfo.mentionedJid = _0x16838e.mentions;
      }
      let _0x4d5ab9 = {};
      if (_0x11e67e != "conversation") {
        _0x4d5ab9 = _0x12f905.message[_0x11e67e].contextInfo;
      }
      _0x346d24[_0x11e67e].contextInfo = {
        ..._0x4d5ab9,
        ..._0x346d24[_0x11e67e].contextInfo
      };
      const _0x97db4a = await generateWAMessageFromContent(_0x4bc966, _0x346d24, _0x16838e ? {
        ..._0x346d24[_0x11e67e],
        ..._0x16838e,
        ...(_0x16838e.contextInfo ? {
          contextInfo: {
            ..._0x346d24[_0x11e67e].contextInfo,
            ..._0x16838e.contextInfo
          }
        } : {})
      } : {});
      await _0x30dcfd.relayMessage(_0x4bc966, _0x97db4a.message, {
        messageId: _0x97db4a.key.id
      });
      return _0x97db4a;
    };
    _0x2f6cbb.forward = async (_0xac708b, _0x572a34, _0x443573 = {}) => {
      let _0x171600 = await generateWAMessageFromContent(_0xac708b, _0x572a34, {
        ..._0x443573,
        userJid: _0x30dcfd.user.id
      });
      let _0x259dd3 = {
        viewOnceMessage: {
          message: {
            ..._0x171600.message
          }
        }
      };
      await _0x30dcfd.relayMessage(_0xac708b, _0x259dd3, {
        messageId: _0x171600.key.id,
        ..._0x443573
      });
      return _0x259dd3;
    };
    if (config.ALWAYS_ONLINE) {
      _0x30dcfd.sendPresenceUpdate("available", _0x2f6cbb.user);
    } else {
      _0x30dcfd.sendPresenceUpdate("unavailable", _0x2f6cbb.user);
    }
    _0x2f6cbb.react = async _0xbd9ad4 => {
      return await _0x30dcfd.sendMessage(_0x2f6cbb.jid, {
        react: {
          text: _0xbd9ad4,
          key: _0x2f6cbb.key
        }
      });
    };
    _0x2f6cbb.sendPoll = async (_0x10193c, _0x1dec3e = "", _0x4da21f = [], _0xed9622 = 1) => {
      return await _0x30dcfd.sendMessage(_0x10193c, {
        poll: {
          name: _0x1dec3e,
          values: _0x4da21f
        }
      });
    };
    _0x2f6cbb.poll = async (_0x4cdddc, _0x56601e, _0x45bc6e) => {
      return await _0x30dcfd.relayMessage(_0x4cdddc, {
        pollCreationMessage: {
          name: _0x56601e,
          options: _0x45bc6e.map(_0xb75cf9 => {
            return {
              optionName: _0xb75cf9
            };
          }),
          selectableOptionsCount: _0x45bc6e.length
        }
      }, {});
    };
    _0x2f6cbb.reply = async _0x4e404b => {
      return await _0x30dcfd.sendMessage(_0x2f6cbb.jid, {
        text: _0x4e404b
      }, {
        quoted: _0x2f6cbb
      });
    };
    _0x2f6cbb.sendFromUrl = async (_0x2b47f0, _0x19b12e = {}) => {
      let _0x1e85b3 = await fromBuffer(await getBuffer(_0x2b47f0).catch(async () => (await fetch(_0x2b47f0)).buffer()));
      if (_0x1e85b3.mime.split("/")[0] === "audio") {
        _0x19b12e.mimetype = "audio/mpeg";
      }
      return await _0x30dcfd.sendMessage(_0x2f6cbb.jid, {
        [_0x1e85b3.mime.split("/")[0]]: await getBuffer(_0x2b47f0).catch(async () => (await fetch(_0x2b47f0)).buffer()),
        ..._0x19b12e
      }, {
        ..._0x19b12e
      });
    };
    _0x2f6cbb.sendMsg = async (_0x2d19b3, _0x46a9fa, _0x3d6035 = {
      packname: "A-S-W-I-N-S-P-A-R-K-Y"
    }, _0x5cfc08 = "text") => {
      {
        switch (_0x5cfc08.toLowerCase()) {
          case "text":
            {
              return await _0x30dcfd.sendMessage(_0x2d19b3, {
                text: _0x46a9fa,
                ..._0x3d6035
              }, {
                ..._0x3d6035
              });
            }
            break;
          case "image":
            {
              if (!Buffer.isBuffer(_0x46a9fa) && !(await isUrl(_0x46a9fa))) {
                return;
              }
              return await _0x30dcfd.sendMessage(_0x2d19b3, {
                image: Buffer.isBuffer(_0x46a9fa) ? _0x46a9fa : (await isUrl(_0x46a9fa)) ? await getBuffer(_0x46a9fa).catch(async () => (await fetch(_0x46a9fa)).buffer()) : null,
                ..._0x3d6035
              }, {
                ..._0x3d6035
              });
            }
            break;
          case "video":
            {
              if (!Buffer.isBuffer(_0x46a9fa) && !(await isUrl(_0x46a9fa))) {
                return;
              }
              return await _0x30dcfd.sendMessage(_0x2d19b3, {
                video: Buffer.isBuffer(_0x46a9fa) ? _0x46a9fa : (await isUrl(_0x46a9fa)) ? await getBuffer(_0x46a9fa).catch(async () => (await fetch(_0x46a9fa)).buffer()) : null,
                ..._0x3d6035
              }, {
                ..._0x3d6035
              });
            }
            break;
          case "audio":
            {
              if (!Buffer.isBuffer(_0x46a9fa) && !(await isUrl(_0x46a9fa))) {
                return;
              }
              return await _0x30dcfd.sendMessage(_0x2d19b3, {
                audio: Buffer.isBuffer(_0x46a9fa) ? _0x46a9fa : (await isUrl(_0x46a9fa)) ? await getBuffer(_0x46a9fa).catch(async () => (await fetch(_0x46a9fa)).buffer()) : null,
                ..._0x3d6035
              }, {
                ..._0x3d6035
              });
            }
            break;
          case "sticker":
            {
              const {
                data: _0x140054,
                mime: _0x7aa199
              } = await _0x2f6cbb.getFile(_0x46a9fa);
              const _0x16e37a = _0x7aa199 === "image/webp" ? await addExifToWebP(_0x140054, _0x3d6035) : _0x7aa199.startsWith("video") ? await videoToWebP(_0x140054, _0x3d6035) : _0x7aa199.startsWith("image") ? await imageToWebP(_0x140054, _0x3d6035) : null;
              if (!_0x16e37a) {
                throw new Error("Unsupported media type");
              }
              return await _0x30dcfd.sendMessage(_0x2d19b3, {
                sticker: _0x16e37a,
                ..._0x3d6035
              }, _0x3d6035);
            }
            break;
        }
      }
    };
  }
  return _0x2f6cbb;
}
module.exports = {
  serialize: serialize
};
