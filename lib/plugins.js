const {
  HANDLERS,
  WORK_TYPE
} = require("../config.js");
var config = require("../config.js");
var sparkymon;
if (config.HANDLERS == "false") {
  sparkymon = "^";
} else {
  sparkymon = config.HANDLERS;
}
var aswin;
if (config.HANDLERS.split("").length > 1 && config.HANDLERS.split("")[0] === config.HANDLERS.split("")[1]) {
  aswin = config.HANDLERS;
} else if (/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(sparkymon) && sparkymon !== "^") {
  aswin = "^[" + sparkymon + "]";
} else {
  aswin = sparkymon;
}
if (config.MULTI_HANDLERS && aswin.includes("^[")) {
  aswin = aswin + "?";
}
const commands = [];
function Sparky(_0x1ac092, _0x8a3ce2) {
  const _0x4c84dc = _0x1ac092;
  _0x4c84dc.function = _0x8a3ce2;
  _0x4c84dc.name = new RegExp(aswin + "\\s*" + _0x1ac092.name + "\\s*(?!\\S)(.*)$", "i");
  if (_0x1ac092.on === undefined && _0x1ac092.name === undefined) {
    _0x4c84dc.on = "message";
    _0x4c84dc.fromMe = false;
  }
  if (_0x4c84dc.name !== undefined || !_0x4c84dc.name) {
    _0x4c84dc.dontAddCommandList = false;
  }
  if (_0x4c84dc.on) {
    _0x4c84dc.dontAddCommandList = true;
  }
  if (!_0x1ac092.category) {
    _0x4c84dc.category = "misc";
  }
  commands.push(_0x4c84dc);
  return _0x4c84dc;
}
const isPublic = WORK_TYPE.toLowerCase() === "private" ? "public" : true && false;
module.exports = {
  commands: commands,
  Sparky: Sparky,
  isPublic: isPublic
};
