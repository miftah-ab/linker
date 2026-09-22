# LINKER

**Intelligent Professional Presence Architecture for LinkedIn**

Linker transforms your real engineering work, architectural decisions, project breakthroughs, and validated knowledge into strategic, credible LinkedIn leadership.

Unlike generic AI tools that hallucinate statistics and generate generic clichés, Linker grounds every draft exclusively in your verified knowledge entries, live project journals, and evidence-backed identity.

---

## ⚡ Core Architecture

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Authentication**: NextAuth.js v5 (JWT Strategy, Credentials & Official LinkedIn OAuth)
- **Primary AI Engine**: Groq (LLaMA 3.3 70B Versatile) for ultra-low latency, grounded drafting
- **Fallback AI Engine**: OpenRouter (Claude 3.5 Sonnet / compatible models)
- **Quality & Cringe Filter**: Heuristic rule engine detecting generic buzzwords, fake virality, and unsupported claims
- **Publishing & Audit**: Official LinkedIn OAuth 2.0 & Share API with human-in-the-loop sign-off

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/miftah-ab/linker.git
cd linker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL (Supabase PostgreSQL), `NEXTAUTH_SECRET`, and API keys (`GROQ_API_KEY`, optional `OPENROUTER_API_KEY`, optional `LINKEDIN_CLIENT_ID`).

### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the workspace.

---

## 📂 Key Directory Structure

```
linker/
├── prisma/
│   └── schema.prisma         # Full database schema with linker_ prefixed tables
├── src/
│   ├── app/
│   │   ├── api/              # Secure API routes for Auth, Studio, AI, Identity, Knowledge
│   │   ├── app/              # Authenticated workspace routes (Overview, Studio, Knowledge, etc.)
│   │   ├── auth/             # Sign in & registration flows
│   │   └── page.tsx          # Production landing page
│   ├── components/           # UI components (Sidebar, Header, MobileNav, Logo, ThemeToggle)
│   ├── lib/
│   │   ├── ai/               # Groq primary + OpenRouter fallback provider & Quality Review
│   │   ├── auth.ts           # NextAuth v5 configuration
│   │   ├── prisma.ts         # Prisma singleton client
│   │   ├── linkedin.ts       # Official LinkedIn API client
│   │   └── publishing.ts     # Publishing worker and idempotency manager
│   └── styles/               # CSS design system (tokens, components, layout, landing)
```

---

## 🔒 Security & Privacy

- No automated headless browser scraping or unofficial LinkedIn cookies.
- Real OAuth 2.0 permissions with explicit consent.
- Zero training of public LLMs on your private project journals.
- Mandatory human review before any post is published.
