# Changes from upstream X-BOT-MD 3.7.0

Removed (data-to-author / remote-control paths)
- Hardcoded owner number injected into SUDO on every message (lib/serialize.js, lib/index.js, config.js, app.json, README)
- `>` eval remote-code-execution handler (plugins/sudo.js)
- Author's shared cloud DB credential (config.js) -> default is now local `sqlite://./bot.db`
- Session download from the author's gist; `SESSION_ID` removed everywhere
- Auto-join of the author's WhatsApp group on every connect
- `.url` media upload to the author's server (command + functions removed)
- `.rentbot`, `.pair`, `.repo`, `.sc` (sent numbers to / advertised the author) -> plugins/manage.js deleted
- Git auto-update from upstream: `.update` command, 60s poller, VPS/Heroku branches of app.update(), simple-git dependency
- Dockerfile no longer `git clone`s upstream; it copies your local code
- Tracking thumbnail on the author's domain (BOT_INFO / AUDIO_DATA URL part)
- Upstream deploy / QR-pairing links in README, .github/FUNDING.yml

Added
- `pair.js`: local-only pairing-code login. Session in ./lib/session (0700/0600), never uploaded.
- index.js refuses to start without a paired local session; stops on logout instead of looping.
- `API` env var (default empty) for downloader/translate/YouTube commands. They are disabled until you set a service you control.
- URL guard in getJson/getBuffer: rejects unconfigured API and the author's domains.
- WORK_TYPE default `private`; SUDO default empty (set your own number).
- .gitignore / .dockerignore exclude session, bot.db, config.env.
- Obfuscated files replaced with readable (deobfuscated) versions. Variable names are still `_0x....`.

Not changed yet (awaiting your decision): branding / name fields (X-BOT-MD, ASWIN SPARKY, STICKER_DATA, menu links, package.json author).
