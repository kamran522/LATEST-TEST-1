const { Sparky, isPublic } = require("../lib");
const { getJson, getString } = require("./pluginsCore");
const config = require("../config.js");

const lang = getString("download");

function buildApiUrl(endpoint, mediaUrl) {
    if (!config.API) {
        throw new Error("Set the API environment variable to your downloader API base URL.");
    }

    const base = config.API.replace(/\/+$/, "");
    return `${base}/api/downloader/${endpoint}?url=${encodeURIComponent(mediaUrl)}`;
}

function findVideoUrl(payload) {
    const data = payload?.data ?? payload?.result ?? payload;

    if (typeof data === "string") return data;
    if (Array.isArray(data)) {
        for (const item of data) {
            const found = findVideoUrl(item);
            if (found) return found;
        }
        return null;
    }

    if (data && typeof data === "object") {
        const candidates = [
            data.video,
            data.play,
            data.play_url,
            data.no_watermark,
            data.nowm,
            data.hdplay,
            data.download_url,
            data.url
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && /^https?:\/\//i.test(candidate)) {
                return candidate;
            }
        }
    }

    return null;
}

Sparky(
    {
        name: "insta",
        fromMe: isPublic,
        desc: "Download Instagram photos, reels, and videos",
        category: "downloader"
    },
    async ({ m, args }) => {
        const mediaUrl = args || m.quoted?.text;
        if (!mediaUrl) return m.reply(lang.NEED_URL);

        try {
            await m.react("⬇️");
            const response = await getJson(buildApiUrl("igdl", mediaUrl));
            const items = response?.data;

            if (!Array.isArray(items) || items.length === 0) {
                throw new Error("The Instagram API did not return any downloadable media.");
            }

            for (const item of items) {
                if (!item?.url) continue;
                await m.sendMsg(m.jid, item.url, { quoted: m }, item.type || "video");
            }

            await m.react("✅");
        } catch (error) {
            console.error("Instagram download failed:", error);
            await m.react("❌");
            await m.reply("Could not download that Instagram link. Check the link and API configuration.");
        }
    }
);

Sparky(
    {
        name: "tiktok",
        fromMe: isPublic,
        desc: "Download TikTok videos",
        category: "downloader"
    },
    async ({ m, args }) => {
        const mediaUrl = args || m.quoted?.text;
        if (!mediaUrl) return m.reply(lang.NEED_URL);

        try {
            await m.react("⬇️");
            const response = await getJson(buildApiUrl("tiktok", mediaUrl));
            const videoUrl = findVideoUrl(response);

            if (!videoUrl) {
                throw new Error("The TikTok API response did not contain a video URL.");
            }

            await m.sendFromUrl(videoUrl, { caption: "Downloaded from TikTok" });
            await m.react("✅");
        } catch (error) {
            console.error("TikTok download failed:", error);
            await m.react("❌");
            await m.reply("Could not download that TikTok video. Check the link and API configuration.");
        }
    }
);
