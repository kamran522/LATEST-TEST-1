const config = require("../config");
async function whatsappAutomation(_0x421c51, _0x15ee6b, _0x2f1c27) {
  if (config.LOGS && _0x2f1c27.type === "notify" && !_0x15ee6b?.sender?.includes(_0x421c51?.user?.id?.split(":")[0])) {} else if (config.LOGS && _0x2f1c27.type !== "notify" && !_0x15ee6b?.sender?.includes(_0x421c51?.user?.id?.split(":")[0])) {}
  if (config.AUTO_STATUS_VIEW && _0x15ee6b.key && _0x15ee6b.key.remoteJid === "status@broadcast" && _0x15ee6b.key.participant) {
    try {
      await _0x421c51.readMessages([_0x15ee6b.key]);
    } catch (_0x2c25a1) {}
    if (config.STATUS_REACTION) {
      const _0x34518f = config.STATUS_REACTION_EMOJI.split(",");
      const _0xd9e19d = _0x34518f[Math.floor(Math.random() * _0x34518f.length)];
      try {
        await _0x421c51.sendMessage("status@broadcast", {
          react: {
            key: _0x15ee6b.key,
            text: _0xd9e19d
          }
        }, {
          statusJidList: [_0x15ee6b.key.participant, _0x421c51.user.id].filter(Boolean)
        });
      } catch (_0x20715) {}
    }
    if (config.STATUS_REPLY) {
      try {
        await _0x421c51.sendMessage(_0x15ee6b.key.participant, {
          text: config.STATUS_REPLY_MSG
        }, {
          quoted: _0x15ee6b
        });
      } catch (_0xfde5b6) {}
    }
  }
}
async function callAutomation(_0x477b57, _0xf7ab61) {
  if (config.REJECT_CALL && _0xf7ab61.status === "offer" && !config.SUDO.includes(_0xf7ab61.from.split("@")[0])) {
    await _0x477b57.rejectCall(_0xf7ab61.id, _0xf7ab61.from);
    return await _0x477b57.sendMessage(_0xf7ab61.from, {
      text: config.REJECT_CALL_MSG
    });
  }
  if (config.CALL_BLOCK && _0xf7ab61.status === "offer" && !config.SUDO.includes(_0xf7ab61.from.split("@")[0])) {
    await _0x477b57.rejectCall(_0xf7ab61.id, _0xf7ab61.from);
    await _0x477b57.sendMessage(_0xf7ab61.from, {
      text: config.CALL_BLOCK_MSG
    });
    return await _0x477b57.updateBlockStatus(_0xf7ab61.from, "block");
  }
}
module.exports = {
  whatsappAutomation: whatsappAutomation,
  callAutomation: callAutomation
};
