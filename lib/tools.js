const fs = require("fs");
const axios = require("axios");
const config = require("../config");
const path = require("path");
const FILE = "./chatMemory.json";
function loadMemory() {
  try {
    if (!fs.existsSync(FILE)) {
      return {};
    }
    const _0x6c4fcd = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(_0x6c4fcd);
  } catch (_0x3b87f6) {
    console.log("Memory corrupted. Resetting...");
    return {};
  }
}
function saveMemory(_0x25de5e) {
  fs.writeFileSync(FILE + ".tmp", JSON.stringify(_0x25de5e, null, 2));
  fs.renameSync(FILE + ".tmp", FILE);
}
function addMessage(_0x3b65b4, _0x1e5aad, _0x317796) {
  const _0x4f4695 = loadMemory();
  if (!_0x4f4695[_0x3b65b4]) {
    _0x4f4695[_0x3b65b4] = [];
  }
  _0x4f4695[_0x3b65b4].push({
    role: _0x1e5aad,
    content: _0x317796
  });
  if (_0x4f4695[_0x3b65b4].length > 10) {
    _0x4f4695[_0x3b65b4] = _0x4f4695[_0x3b65b4].slice(-10);
  }
  saveMemory(_0x4f4695);
}
function getMessages(_0x284604) {
  const _0x10d3bb = loadMemory();
  return _0x10d3bb[_0x284604] || [];
}
async function askGroq(_0x2ae285) {
  try {
    const _0x310376 = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
      model: "llama-3.1-8b-instant",
      messages: _0x2ae285
    }, {
      headers: {
        Authorization: "Bearer " + config.GROQ_API_KEY,
        "Content-Type": "application/json"
      }
    });
    return _0x310376.data.choices[0].message.content;
  } catch (_0x210e95) {
    console.log("Groq error:", _0x210e95.response?.data || _0x210e95.message);
    throw new Error(_0x210e95.response?.data || _0x210e95.message);
  }
}
module.exports = {
  addMessage: addMessage,
  getMessages: getMessages,
  askGroq: askGroq
};
