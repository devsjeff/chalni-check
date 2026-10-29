# Karva Chauth Moon Night

A cinematic rooftop Karva Chauth night. About three minutes, spoken Hindi/Hinglish, one small thing to do in every scene. Static site, no login, no backend.

## Run locally

```bash
npm i
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Voice

On a machine with Python:

```bash
pip install edge-tts mutagen
npm run voice
```

This reads `src/data/script.json` and writes `public/audio/voice/{id}.mp3` plus `durations.json`. Missing mp3s fall back to `speechSynthesis`, then to timed subtitles.

## Images

Drop Prompt B photos into `assets-src/` with the exact names from the kit (`her-01-waiting.png`, `him-01-waiting.png`, …), then:

```bash
npm run images
```

Until those files exist, the app uses a dark terrace, a procedural moon, and a lit silhouette. Placeholder filenames only show in `npm run dev` or with `?debug=1`.

`npm run visuals` writes a stand-in `moon.webp` and `og.jpg` so the WhatsApp preview is never empty.

## Deploy

Push to GitHub. On [vercel.com](https://vercel.com) → New Project:

- Framework: **Vite**
- Build command: `npm run build`
- Output dir: `dist`

Or from this folder:

```bash
npx vercel --prod
```

No environment variables are required. Optional: `SITE_URL=https://your-domain.vercel.app` so Open Graph tags use absolute URLs.

## Personal links

```
https://YOUR-SITE/?as=girl&name=Riya
https://YOUR-SITE/?as=boy&name=Aarav
```

`as` is `girl` or `boy`. `name` is optional, max 20 characters, shown only in subtitles and on the keepsake card. Voice never says the name.

Jump to a scene while testing: `?debug=1&scene=B4`.

## Where to edit lines

`src/data/script.json` — `hinglish` is the subtitle, `hindi` is what TTS speaks, `en` is the English toggle.

Scene order and poses: `src/data/scenes.ts`.

## Creative additions

Things in the app that go a little beyond the kit, without dropping anything it asked for:

- A tanpura-style Web Audio drone and original SFX if `ambient.mp3` / `sfx/*.mp3` are missing.
- A procedural cratered moon until `moon.webp` is dropped in.
- Keyboard paths for every interaction (Space / Enter).
- An optional chalni selfie after the keepsake card, with a large Skip, camera never auto-starts.
- Device-tilt parallax, in-app-browser banner, landscape “Phone ko seedha karo” hint.
