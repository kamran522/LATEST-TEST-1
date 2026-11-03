const { default: axios } = require('axios');

const BLOCKED_HOSTS = [/aswinsparky/i, /sparky/i, /eswin/i, /sperky/i];
function assertSafeUrl(url) {
	if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
		throw new Error("Remote API is not configured (set API in your environment to a service you control).");
	}
	const host = new URL(url).hostname;
	if (BLOCKED_HOSTS.some((r) => r.test(host))) {
		throw new Error("Blocked request to third-party host: " + host);
	}
}

async function getBuffer(url, options) {
	try {
		assertSafeUrl(url);
		options = options || {};
		const res = await axios({
			method: "get",
			url,
			headers: {
				DNT: 1,
				"Upgrade-Insecure-Request": 1
			},
			...options,
			responseType: "arraybuffer",
		});
		return res.data;
	} catch (e) {
		console.log(`Error : ${e}`);
		throw e;
	}
}


async function getJson(url, options) {
	try {
		assertSafeUrl(url);
		options = options || {};
		const res = await axios({
			method: "GET",
			url: url,
			headers: {
				"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
			},
			...options,
		});
		return res.data;
	} catch (err) {
		console.log(`Error : ${err}`);
		throw err; 
	}
}


async function extractUrlsFromText(text) {
    if (!text) return false;
    const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%\+.~#?!&//=]*)/gi;
    let urls = text.args(regexp);
    return urls || [];
};


async function isUrl(url) {
	return new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, "gi").test(url);
}

module.exports = {getBuffer, getJson, extractUrlsFromText, isUrl};
