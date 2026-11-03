const config = require("../../config");
const {
  default: axios
} = require("axios");
const {
  exec
} = require("child_process");
const fs = require("fs");
class appClient {
  constructor() {
    this.platform = process.env.PWD?.includes("userland") ? "LINUX" : process.env.PITCHER_API_BASE_URL?.includes("codesandbox") ? "CODESANDBOX" : process.env.REPLIT_USER ? "REPLIT" : process.env.AWS_REGION ? "AWS" : process.env.TERMUX_VERSION ? "VPS" : process.env.DYNO ? "HEROKU" : process.env.KOYEB_APP_ID ? "KOYEB" : process.env.GITHUB_SERVER_URL ? "GITHUB" : process.env.RENDER ? "RENDER" : process.env.RAILWAY_SERVICE_NAME ? "RAILWAY" : process.env.VERCEL ? "VERCEL" : process.env.DIGITALOCEAN_APP_NAME ? "DIGITALOCEAN" : process.env.AZURE_HTTP_FUNCTIONS ? "AZURE" : process.env.NETLIFY ? "NETLIFY" : process.env.FLY_IO ? "FLY_IO" : process.env.CF_PAGES ? "CLOUDFLARE" : process.env.SPACE_ID ? "HUGGINGFACE" : "VPS";
    const _0x195d56 = {
      baseURL: "https://app.koyeb.com/v1",
      headers: {}
    };
    _0x195d56.headers["Content-Type"] = "application/json;charset=UTF-8";
    _0x195d56.headers.Authorization = "Bearer " + config.KOYEB_API_KEY;
    this.koyeb = axios.create(_0x195d56);
    const _0x5ab1c9 = {
      Authorization: "Bearer " + config.RENDER_API_KEY
    };
    const _0x2690a8 = {
      baseURL: "https://api.render.com/v1",
      headers: _0x5ab1c9
    };
    this.render = axios.create(_0x2690a8);
    const _0x4b66d7 = {
      baseURL: "https://api.heroku.com/apps/" + config.HEROKU_APP_NAME,
      headers: {}
    };
    _0x4b66d7.headers.Authorization = "Bearer " + config.HEROKU_API_KEY;
    _0x4b66d7.headers.Accept = "application/vnd.heroku+json; version=3";
    _0x4b66d7.headers["Content-Type"] = "application/json";
    this.heroku = axios.create(_0x4b66d7);
  }
  async getAppData() {
    switch (this.platform) {
      case "KOYEB":
        {
          const _0x50c4d0 = await this.koyeb.get("/services");
          return _0x50c4d0.data.services.find(_0x3ca803 => _0x3ca803.name === config.KOYEB_SERVICE_NAME) || false;
        }
      case "RENDER":
        {
          const _0x237932 = await this.render.get("/services");
          const _0x5e2683 = _0x237932.data.find(_0x117827 => _0x117827.service.name === config.RENDER_APP_NAME);
          if (_0x5e2683) {
            return {
              id: _0x5e2683.service.id,
              name: _0x5e2683.service.name,
              region: _0x5e2683.service.serviceDetails.region,
              runtime: _0x5e2683.service.serviceDetails.runtime
            };
          } else {
            return false;
          }
        }
      default:
        console.log("Unsupported platform.", this.platform);
        return false;
    }
  }
  async deploymentInfo() {
    switch (this.platform) {
      case "KOYEB":
        {
          const _0x4557be = await this.getAppData();
          const {
            data: _0x31aa75
          } = await this.koyeb.get("/deployments?service_id/" + _0x4557be.id);
          return _0x31aa75.deployments[0]?.status || false;
        }
      case "RENDER":
        return false;
      default:
        console.log("Unsupported platform.", this.platform);
        return false;
    }
  }
  async update() {
    switch (this.platform) {
      case "KOYEB":
        try {
          const _0x23b824 = await this.getAppData();
          await this.koyeb.post("/services/" + _0x23b824.id + "/redeploy", {
            deployment_group: "prod"
          });
          return true;
        } catch (_0x538657) {
          console.log("Build failed! " + _0x538657.message);
          return false;
        }
      case "RENDER":
        try {
          const _0x111436 = await this.getAppData();
          const _0x3a2c95 = await this.render.post("/services/" + _0x111436.id + "/deploys", {
            option: "clear"
          });
          return _0x3a2c95.status === 201;
        } catch (_0x47262a) {
          console.log("Render update failed! " + _0x47262a.message);
          return false;
        }
      case "VPS":
      case "HEROKU":
        // Auto-update from any remote git repository is intentionally disabled.
        console.log("Automatic updates are disabled in this build.");
        return false;
      default:
        console.log("Unsupported platform: ", this.platform);
        return false;
    }
  }
  async setVar(_0x3bed5b, _0x43e087) {
    switch (this.platform) {
      case "KOYEB":
        {
          const _0x49c693 = await this.getAppData();
          const _0x2000d0 = await this.koyeb.get("/deployments/" + _0x49c693.latest_deployment_id);
          const _0x2efb95 = _0x2000d0.data.deployment.definition.env.flatMap(_0x40e9ac => _0x40e9ac.scopes).find(_0x107ac2 => _0x107ac2.startsWith("region:"));
          const _0x5e80cd = _0x2000d0.data.deployment.definition.env.map(_0x247de1 => _0x247de1.key === _0x3bed5b ? {
            ..._0x247de1,
            value: _0x43e087
          } : _0x247de1);
          if (!_0x5e80cd.some(_0xb2dd2f => _0xb2dd2f.key === _0x3bed5b)) {
            const _0x5198c4 = {
              scopes: [_0x2efb95],
              key: _0x3bed5b,
              value: _0x43e087
            };
            _0x5e80cd.push(_0x5198c4);
          }
          const _0xd484d6 = {
            ..._0x2000d0.data.deployment.definition
          };
          _0xd484d6.env = _0x5e80cd;
          const _0x25a63e = {
            definition: _0xd484d6
          };
          const _0x15b708 = await this.koyeb.patch("/services/" + _0x49c693.id, _0x25a63e);
          return _0x15b708.status === 200;
        }
      case "RENDER":
        {
          const _0x43135f = await this.getAppData();
          const _0x26e05f = await this.render.get("/services/" + _0x43135f.id + "/env-vars");
          const _0x5c6f54 = _0x26e05f.data.map(_0x199d04 => _0x199d04.envVar.key === _0x3bed5b ? {
            ..._0x199d04.envVar,
            value: _0x43e087
          } : _0x199d04.envVar);
          if (!_0x5c6f54.some(_0x38e81f => _0x38e81f.key === _0x3bed5b)) {
            const _0x214565 = {
              key: _0x3bed5b,
              value: _0x43e087
            };
            _0x5c6f54.push(_0x214565);
          }
          const _0x57c3af = await this.render.put("/services/" + _0x43135f.id + "/env-vars", _0x5c6f54);
          await this.update();
          return _0x57c3af.status === 200;
        }
      case "VPS":
        try {
          let _0x2edf87 = "";
          try {
            _0x2edf87 = fs.readFileSync("./config.env", "utf-8");
          } catch {}
          const _0xd56a06 = _0x2edf87 ? _0x2edf87.trim().split("\n") : [];
          let _0x1f7376 = false;
          for (let _0x1a686c = 0; _0x1a686c < _0xd56a06.length; _0x1a686c++) {
            if (_0xd56a06[_0x1a686c].startsWith(_0x3bed5b + "=")) {
              _0xd56a06[_0x1a686c] = _0x3bed5b + "=\"" + _0x43e087 + "\"";
              _0x1f7376 = true;
              break;
            }
          }
          if (!_0x1f7376) {
            _0xd56a06.push(_0x3bed5b + "=\"" + _0x43e087 + "\"");
          }
          fs.writeFileSync("./config.env", _0xd56a06.join("\n"));
          console.log("✅ VPS: Successfully set " + _0x3bed5b + "=" + _0x43e087);
          if (_0x3bed5b === "SESSION") {
            await require("fs-extra").removeSync("./lib/session");
          }
          setTimeout(() => process.exit(0), 1000);
          return true;
        } catch (_0x9584d2) {
          console.error("❌ VPS: Failed to set variable:", _0x9584d2.message);
          return false;
        }
      case "HEROKU":
        {
          if (!config.HEROKU_APP_NAME || !config.HEROKU_API_KEY) {
            console.error("❌ Missing HEROKU_APP_NAME or HEROKU_API_KEY in config.");
            return false;
          }
          try {
            await this.heroku.patch("/config-vars", {
              [_0x3bed5b.toUpperCase()]: _0x43e087
            });
            console.log("✅ Heroku: Successfully set " + _0x3bed5b + "=" + _0x43e087);
            return true;
          } catch (_0x895f21) {
            console.error("❌ Error setting config var on Heroku:", _0x895f21.message);
            return false;
          }
        }
      default:
        console.log("Unsupported platform.", this.platform);
        return false;
    }
  }
  async deleteVar(_0x179019) {
    switch (this.platform) {
      case "KOYEB":
        {
          const _0x1e2d90 = await this.getAppData();
          const _0x435adb = await this.koyeb.get("/deployments/" + _0x1e2d90.latest_deployment_id);
          if (!_0x435adb.data.deployment.definition.env.some(_0x42a8a1 => _0x42a8a1.key === _0x179019)) {
            return false;
          }
          const _0x3afb71 = _0x435adb.data.deployment.definition.env.filter(_0x10e4c7 => _0x10e4c7.key !== _0x179019);
          const _0x2ea2d1 = {
            ..._0x435adb.data.deployment.definition
          };
          _0x2ea2d1.env = _0x3afb71;
          const _0x2fcabe = {
            definition: _0x2ea2d1
          };
          const _0x3afba3 = await this.koyeb.patch("/services/" + _0x1e2d90.id, _0x2fcabe);
          return _0x3afba3.status === 200;
        }
      case "RENDER":
        {
          const _0x2bc3fb = await this.getAppData();
          const _0x1b9544 = await this.render.get("/services/" + _0x2bc3fb.id + "/env-vars");
          if (!_0x1b9544.data.some(_0x293863 => _0x293863.envVar.key === _0x179019)) {
            return false;
          }
          const _0x320512 = _0x1b9544.data.filter(_0x3eaae1 => _0x3eaae1.envVar.key !== _0x179019).map(_0xe4553 => ({
            key: _0xe4553.envVar.key,
            value: _0xe4553.envVar.value
          }));
          const _0x3290ad = await this.render.put("/services/" + _0x2bc3fb.id + "/env-vars", _0x320512);
          await this.update();
          return _0x3290ad.status === 200;
        }
      case "VPS":
        try {
          let _0x1281cc = fs.readFileSync("./config.env", "utf-8");
          let _0x4353e4 = _0x1281cc.trim().split("\n");
          const _0x298d54 = _0x4353e4.filter(_0x36a175 => !_0x36a175.startsWith(_0x179019 + "="));
          if (_0x298d54.length === _0x4353e4.length) {
            return false;
          }
          fs.writeFileSync("./config.env", _0x298d54.join("\n"));
          console.log("🗑 VPS: Successfully deleted " + _0x179019);
          setTimeout(() => process.exit(0), 1000);
          return true;
        } catch {
          console.log("⚠️ config.env not found, nothing to delete.");
          return false;
        }
      case "HEROKU":
        {
          if (!config.HEROKU_APP_NAME || !config.HEROKU_API_KEY) {
            console.error("❌ Missing HEROKU_APP_NAME or HEROKU_API_KEY in config.");
            return false;
          }
          try {
            await axios.patch("https://api.heroku.com/apps/" + config.HEROKU_APP_NAME + "/config-vars", {
              [_0x179019.toUpperCase()]: null
            }, {
              headers: {
                Authorization: "Bearer " + config.HEROKU_API_KEY,
                Accept: "application/vnd.heroku+json; version=3",
                "Content-Type": "application/json"
              }
            });
            console.log("🗑 Heroku: Successfully deleted " + _0x179019);
            return true;
          } catch (_0x11ec9) {
            console.error("❌ Failed to delete " + _0x179019 + " from Heroku:", _0x11ec9.message);
            return false;
          }
        }
      default:
        console.log("Unsupported platform.", this.platform);
        return false;
    }
  }
  async getVars() {
    switch (this.platform) {
      case "KOYEB":
        {
          const _0x3ec904 = await this.getAppData();
          const _0x219583 = await this.koyeb.get("/deployments/" + _0x3ec904.latest_deployment_id);
          return _0x219583.data.deployment.definition.env.map(_0xc9abe2 => ({
            key: _0xc9abe2.key,
            value: _0xc9abe2.value
          })) || [];
        }
      case "RENDER":
        {
          const _0x40024e = await this.getAppData();
          const _0x204cd1 = await this.render.get("/services/" + _0x40024e.id + "/env-vars");
          return _0x204cd1.data.map(_0x5ec09d => ({
            key: _0x5ec09d.envVar.key,
            value: _0x5ec09d.envVar.value
          })) || [];
        }
      case "VPS":
        try {
          const _0x5369e2 = fs.readFileSync("./config.env", "utf-8");
          return _0x5369e2.trim().split("\n").filter(Boolean).map(_0x4de1eb => {
            const [_0x2956de, _0x1a3dbd] = _0x4de1eb.split("=");
            let _0x33905c = _0x1a3dbd?.trim() || "";
            if (_0x33905c.startsWith("\"") && _0x33905c.endsWith("\"")) {
              _0x33905c = _0x33905c.slice(1, -1);
            }
            return {
              key: _0x2956de.trim(),
              value: _0x33905c
            };
          });
        } catch {
          console.log("⚠️ config.env not found, returning empty array.");
          return [];
        }
      case "HEROKU":
        {
          if (!config.HEROKU_APP_NAME || !config.HEROKU_API_KEY) {
            console.error("❌ Missing HEROKU_APP_NAME or HEROKU_API_KEY in config.");
            return [];
          }
          try {
            const {
              data: _0x2dfb85
            } = await axios.get("https://api.heroku.com/apps/" + config.HEROKU_APP_NAME + "/config-vars", {
              headers: {
                Authorization: "Bearer " + config.HEROKU_API_KEY,
                Accept: "application/vnd.heroku+json; version=3"
              }
            });
            return Object.entries(_0x2dfb85).map(([_0x5197bf, _0x394f9f]) => ({
              key: _0x5197bf,
              value: _0x394f9f
            }));
          } catch (_0x436b1a) {
            console.error("❌ Failed to fetch Heroku config vars:", _0x436b1a.message);
            return [];
          }
        }
      default:
        console.log("Unsupported platform.", this.platform);
        return [];
    }
  }
}
module.exports = appClient;
