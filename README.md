# Karwa Chauth Ki Kasam

A login-free, mobile-first Karwa Chauth game. Everything runs in the browser: name, jokes, fake-husband scenes for singles, chalni camera, share card, and an optional ₹20 UPI link. Camera frames and photos are never uploaded.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Original sound files live in `public/audio`. Regenerate them with:

```bash
npm run audio
```

If those files are missing, the site still runs and synthesizes short sounds after you tap a control.

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repository.
3. Framework preset: Next.js. No environment variables are required.
4. Deploy. Camera access needs the HTTPS URL Vercel gives you.

## Camera

The camera starts only after **Camera Allow Karo**. Allow camera permission in the browser prompt. Leave the scene, skip, retake, or close the tab and the video tracks stop. Denied, missing, or insecure cameras can be skipped.

## Payments

The ₹20 button opens a UPI link. This site cannot tell whether a payment succeeded.
