const axios = require("axios");
const config = require("../config");
const cheerio = require("cheerio");
const {
  getJson
} = require("../plugins/pluginsCore");
const validQueryDomains = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "gaming.youtube.com"]);
const validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
const getURLVideoID = _0x4c296d => {
  const _0xac9ecf = new URL(_0x4c296d.trim());
  let _0x2f0368 = _0xac9ecf.searchParams.get("v");
  if (validPathDomains.test(_0x4c296d.trim()) && !_0x2f0368) {
    const _0x2c8bc3 = _0xac9ecf.pathname.split("/");
    _0x2f0368 = _0xac9ecf.host === "youtu.be" ? _0x2c8bc3[1] : _0x2c8bc3[2];
  } else if (_0xac9ecf.hostname && !validQueryDomains.has(_0xac9ecf.hostname)) {
    throw Error("Not a YouTube domain");
  }
  if (!_0x2f0368) {
    throw Error("No video id found: \"" + _0x4c296d + "\"");
  }
  _0x2f0368 = _0x2f0368.substring(0, 11);
  return _0x2f0368;
};
const YtInfo = async _0x3e249f => {
  try {
    const _0x55523f = getURLVideoID(_0x3e249f);
    const _0x15952a = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + _0x55523f + "&format=json";
    const _0x4045e4 = await axios.get(_0x15952a);
    const _0x20f221 = _0x4045e4.data;
    return {
      title: _0x20f221.title,
      thumbnail: _0x20f221.thumbnail_url,
      author: _0x20f221.author_name,
      videoId: _0x55523f
    };
  } catch (_0x1bdbfc) {
    return false;
  }
};
async function yts(_0x363545) {
  try {
    const _0x46522c = await axios.get("https://m.youtube.com/results?search_query=" + encodeURIComponent(_0x363545), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
      }
    });
    const _0x4caa74 = _0x46522c.data;
    const _0x300c37 = cheerio.load(_0x4caa74);
    let _0x1abadc;
    _0x300c37("script").each((_0x3fc937, _0x428020) => {
      const _0x5882db = _0x300c37(_0x428020).html();
      if (_0x5882db && _0x5882db.includes("var ytInitialData =")) {
        const _0x2a806c = _0x5882db.replace(/^var ytInitialData = /, "").replace(/;$/, "");
        _0x1abadc = JSON.parse(_0x2a806c);
      }
    });
    if (!_0x1abadc) {
      throw new Error("Failed to parse YouTube data.");
    }
    const _0x57bf62 = [];
    const _0x32297a = _0x1abadc.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const _0x19ff9e = _0x32297a[0]?.itemSectionRenderer?.contents || [];
    _0x19ff9e.forEach(_0x56c682 => {
      const _0x121996 = Object.keys(_0x56c682)[0];
      const _0x580d9a = _0x56c682[_0x121996];
      if (_0x121996 === "videoRenderer") {
        _0x57bf62.push({
          title: _0x580d9a.title?.runs[0]?.text,
          videoId: _0x580d9a.videoId,
          url: "https://youtu.be/" + _0x580d9a.videoId,
          image: _0x580d9a.thumbnail?.thumbnails?.pop()?.url,
          thumbnail: _0x580d9a.thumbnail?.thumbnails?.pop()?.url,
          duration: _0x580d9a.lengthText?.simpleText,
          views: _0x580d9a.viewCountText?.simpleText,
          publishedTime: _0x580d9a.publishedTimeText?.simpleText,
          author: _0x580d9a.ownerText?.runs[0]?.text
        });
      }
    });
    return _0x57bf62;
  } catch (_0x2d117c) {
    console.error("Error in ytsearch:", _0x2d117c);
    return [];
  }
}
async function ytv(_0x41ba7c) {
  try {
    let _0x2a7449 = await getJson(config.API + "/api/downloader/ytv?url=" + _0x41ba7c);
    return _0x2a7449.data.url;
  } catch (_0x50f1b0) {
    console.error("Error fetching audio:", _0x50f1b0);
    throw _0x50f1b0;
  }
}
async function yta(_0x23641a) {
  try {
    let _0x17f604 = await getJson(config.API + "/api/downloader/song?search=" + _0x23641a);
    return _0x17f604.data.url;
  } catch (_0x423c3c) {
    console.error("Error fetching audio:", _0x423c3c);
    throw _0x423c3c;
  }
}
async function spdl(_0x188562) {
  try {
    let _0x335e23 = await getJson(config.API + "/api/downloader/spotify?url=" + _0x188562);
    return _0x335e23.data.download;
  } catch (_0x5beecb) {
    console.error("Error fetching audio:", _0x5beecb);
    throw _0x5beecb;
  }
}
module.exports = {
  YtInfo: YtInfo,
  yts: yts,
  ytv: ytv,
  yta: yta,
  spdl: spdl
};
