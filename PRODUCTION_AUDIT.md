# 🚦 Production Readiness Audit — Linker

## Overall Verdict: **Not Yet** — ~70% ready

The build is clean and the UI is polished, but there are **critical security issues** that must be fixed before going live.

---

## 🔴 Critical (Must fix before production)

### 1. `.env.local` contains real secrets — and it's almost in git
Your `.env.local` file contains live credentials:
- **Supabase DB password** in the `DATABASE_URL`
- **OpenRouter API key** (`sk-or-v1-...`)
- **LinkedIn Client Secret**
- **CRON_SECRET**

✅ Good news: `.gitignore` has `.env*` so the file is NOT committed.  
⚠️ Bad news: Anyone on your machine can read it, and you must set these on Vercel as environment variables — **not** in the repo.

**Action:** Set all secrets in Vercel dashboard → Settings → Environment Variables.

---

### 2. Dev-login bypass is shipped to production code
`/api/auth/dev-login` exists in your production build. While it checks for `localhost` hostname, this is **not safe enough** — the `NODE_ENV` check can be spoofed via environment, and the cookie (`dev_session=true`, `httpOnly: false`) is readable by JavaScript.

```
httpOnly: false  ← XSS can read/set this cookie
```

**Action: Before deploying to production, either:**
- Delete `src/app/api/auth/dev-login/route.ts` entirely, or
- Wrap it with `if (process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== 'true') return 403`  
  and **never** set that env var in Vercel.

---

### 3. Middleware deprecation warning
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```
Next.js 16 renamed `middleware.ts` → `proxy.ts`. This **will break** in a future Next.js version.

**Action:** Run:
```bash
npx @next/codemod@canary middleware-to-proxy .
```

---

## 🟡 Important (Should fix soon)

### 4. No error boundaries in the UI
If an API call fails (e.g., Supabase is down), pages will crash with a white screen. No `error.tsx` files exist.

### 5. API routes have no rate limiting
Your AI generation endpoints (`/api/studio/generate`) and LinkedIn publish endpoints have no rate limiting — open to abuse.

### 6. No `loading.tsx` files
Next.js App Router uses `loading.tsx` for Suspense boundaries. Without them, page transitions feel slow.

### 7. `GROQ_API_KEY` is empty
Your primary AI provider has no key set. The app falls back to OpenRouter, but this could fail silently.

---

## 🟢 What's Already Good

| Area | Status |
|------|--------|
| Build | ✅ Clean, 0 errors |
| TypeScript | ✅ Passes |
| Auth flow (Supabase) | ✅ Correct middleware |
| `.env` not in git | ✅ Properly gitignored |
| Favicon / brand assets | ✅ Full set generated |
| Responsive UI | ✅ Fixed across all pages |
| Lucide icons | ✅ Consistent throughout |
| LinkedIn OAuth | ✅ Redirect URI set to production URL |
| Static pages | ✅ 45 pages pre-rendered |

---

## ✅ Pre-Production Checklist

- [ ] **Delete or guard** `src/app/api/auth/dev-login/route.ts`
- [ ] **Set all env vars** in Vercel dashboard (not in repo)
- [ ] **Run middleware codemod**: `npx @next/codemod@canary middleware-to-proxy .`
- [ ] **Add Groq API key** or confirm OpenRouter fallback is sufficient
- [ ] **Add `error.tsx`** files to key routes
- [ ] **Test real Supabase auth** end-to-end on production URL
- [ ] **Rotate credentials** if you've ever pushed `.env.local` by accident

---

## Quick Fix Priority

```
🔴 Fix dev-login bypass  →  🔴 Set Vercel env vars  →  🟡 Run middleware codemod  →  Deploy
```
