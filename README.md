# Daily Plan Site

A personal site with two sections:

1. **My Day** — today's training focus/exercises (public), plus a password-gated
   medications & supplements checklist (private), a water tracker, and live
   weather with a hydration reminder on hot days.
2. **Mom's Kitchen** — tomorrow's breakfast/lunch/dinner (recipe, ingredients,
   what to prep tonight), rotated automatically, with a "Share on WhatsApp"
   button. This section is public — no login needed.

A small chat widget (bottom-right) answers questions about the plan using the
Gemini API. It only discusses medications/supplements if you're logged in.

---

## 1. How the private/public split actually works

This matters, so it's worth being precise about it:

- `data.js` (loaded in the browser) contains **only** public information:
  the weekly training split, exercise lists, diet rotation, meal timing,
  and nutrition targets.
- Medications and supplements live in `api/_privateData.js`, which is
  **never sent to the browser**. It's only readable by the serverless
  function `api/private-data.js`, which itself checks for a valid login
  session before returning anything.
- Logging in calls `api/login.js`, which checks your password (stored as
  an environment variable, never in the code) and sets a signed,
  `HttpOnly` cookie. The site can't be tricked into showing private data
  by editing the page in the browser, because the data was never there
  to begin with.

**Honest limitation:** this is a password gate suitable for keeping casual
visitors (or a shared link) from seeing your medication list — it is not
audited, clinical-grade security, and "HIPAA compliant" isn't really a
meaningful label for a personal hobby project like this one. Treat it as a
lock on the door, not a vault.

---

## 2. One-time setup

### a) Push to GitHub

```bash
cd daily-plan-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### b) Import into Vercel

1. Go to vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset: choose **Other** (this is a plain static site + API
   routes, no build step needed).
3. Before the first deploy (or right after, then redeploy), set the
   environment variables below.

### c) Environment variables (Vercel → Project Settings → Environment Variables)

| Name | Value |
|---|---|
| `SITE_PASSWORD` | Whatever password you want to use to log in |
| `SESSION_SECRET` | A long random string — generate with the command in `.env.example` |
| `GEMINI_API_KEY` | From https://aistudio.google.com/apikey |

Redeploy after adding these (Vercel → Deployments → ⋯ → Redeploy).

### d) Set your program start date

Open `data.js` and change:

```js
const PROGRAM_START_DATE = "2026-07-13"; // must be a Monday
```

to the Monday you actually start training. Everything else (week number,
Block A/B, deload weeks, diet rotation) calculates itself from this one date.

---

## 3. Editing content later

- **Diet, exercises, meal timing, targets** → edit `data.js`, commit, push.
  Vercel redeploys automatically.
- **Medications/supplements** → edit `api/_privateData.js` (never touches
  the public bundle).
- **Password** → change `SITE_PASSWORD` in Vercel's dashboard (no code change,
  no redeploy needed — takes effect on next login).

---

## 4. Other features worth adding

Roughly in order of "easy, high value" → "bigger project":

- **Push reminders** — browser Notification API to ping you at 7:30 AM,
  1:00 PM, bedtime, etc. (Needs the site kept open or converting to a PWA
  with a service worker for background notifications.)
- **Install as an app (PWA)** — add a manifest + service worker so it can
  be "Added to Home Screen" on your phone and opens like a native app.
- **Streak / adherence tracking** — you already have localStorage
  check-offs for meds/supplements; extending this to a weekly streak view
  is a small addition.
- **Body measurement / progress log** — a simple form (weight, waist,
  lifts) saved to localStorage, with a small chart over time.
- **Grocery list generator** — since the diet already rotates through a
  known list, a button that outputs "this week's shopping list" is mostly
  free given the data you already have.
- **Hindi labels for Mom's Kitchen** — a language toggle for that section
  specifically, since it's the one she'll actually use day to day.
- **Editable-via-chat plan** — letting the Gemini chatbot actually rewrite
  `data.js` is possible but is meaningfully bigger: it needs somewhere to
  save changes (either committing back to GitHub via its API, using a
  small database, or Vercel KV) plus safeguards so it can't silently break
  the page. Worth doing once the read-only version feels too limited —
  ask, and it can be scoped out separately.
- **Doctor-visit export** — a button that generates a clean PDF/print
  view of the last N days of adherence (meds taken, workouts done) to
  bring to appointments.

---

## 5. Local testing

Vercel's CLI can run the API routes locally:

```bash
npm install -g vercel
vercel dev
```

Then open the printed local URL. Plain opening of `index.html` in a browser
will show the public sections but the `/api/...` calls (login, private data,
chat) will fail, since those need the Vercel dev/production environment.
