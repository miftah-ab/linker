# Linker

> Intelligent Professional Presence Architecture for LinkedIn

Linker transforms real engineering work, architectural decisions, technical breakthroughs, and validated project knowledge into strategic, authentic LinkedIn thought leadership.

Unlike generic social media automation tools that hallucinate statistics, generate generic cliches, or trigger LinkedIn spam detection, Linker grounds every draft exclusively in your verified knowledge entries, technical journals, and evidence-backed identity.

---

## Highlights

- **Grounded AI Drafting**: Generates publication-ready technical posts using your real project journals, architectural decisions, and verified knowledge.
- **Dual AI Engine**: Fast drafting via Groq (LLaMA 3.3 70B Versatile) with seamless fallback to OpenRouter (Claude 3.5 Sonnet and compatible models).
- **Anti-Cringe and Fluff Filter**: Heuristic analysis engine that flags fake engagement hooks, hollow buzzwords, unearned authority, and hyperbolic claims.
- **Official LinkedIn Integration**: Compliant LinkedIn OAuth 2.0 and official Share API (REST) with human-in-the-loop approval. No scraping, no session-cookie hacks, no ban risk.
- **Supabase Cloud Infrastructure**: Secure authentication powered by Supabase Auth (LinkedIn OIDC and Google OAuth) with PostgreSQL database managed via Prisma ORM.
- **Editorial Studio**: Full lifecycle management across Idea, Draft, Review, Scheduled, and Published states with post preview and character counter.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server components, Server Actions, route handlers |
| **Runtime** | React 19 + TypeScript | Strict typing, Suspense, client and server boundaries |
| **Styling** | Custom CSS Design System | Modern tokens, light and dark themes, zero runtime overhead |
| **Database** | Supabase (PostgreSQL) | Managed relational database |
| **ORM** | Prisma | Type-safe queries, relational modeling, migrations |
| **Auth** | Supabase Auth (`@supabase/ssr`) | Secure cookie sessions, OAuth 2.0 (LinkedIn OIDC, Google) |
| **Primary AI** | Groq Cloud | LLaMA 3.3 70B Versatile (ultra-low latency inference) |
| **Fallback AI** | OpenRouter | Claude 3.5 Sonnet and flexible multi-model routing |
| **Social API** | LinkedIn REST API v2 | Official OAuth 2.0 authorization and UGC post publishing |

---

## Architecture and Workflow

```
[ Developer Knowledge & Logs ]
            │
            ▼
[ Linker Knowledge Vault ] ────► [ Identity & Tone Guidelines ]
            │                                 │
            └───────────────┬─────────────────┘
                            ▼
           [ Groq / OpenRouter AI Pipeline ]
                            │
                            ▼
          [ Cringe & Quality Scoring Filter ]
                            │
                            ▼
              [ Studio Draft & Review ]
                            │
                   (Human Approval)
                            │
                            ▼
          [ Official LinkedIn Share API ]
```

1. **Capture**: Log project accomplishments, architecture decisions, and lessons learned into the Knowledge Base.
2. **Draft**: Choose a topic or select an idea. The AI engine constructs an authoritative post anchored strictly in your facts.
3. **Audit**: The quality filter checks for buzzwords, hollow hooks, and tone violations.
4. **Approve and Publish**: Edit and approve the final content. Publish directly to LinkedIn or schedule for peak engagement hours.

---

## Getting Started

### Prerequisites

- Node.js 18.18 or higher (Node.js 20+ recommended)
- npm, pnpm, or yarn
- A Supabase project (free tier works great)
- A LinkedIn Developer App (for LinkedIn publishing and sign-in)
- A Groq Cloud API key (free tier available at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository

```bash
git clone https://github.com/miftah-ab/linker.git
cd linker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
DATABASE_URL="postgresql://postgres:your-db-password@db.your-project-id.supabase.co:5432/postgres"

# Primary AI: Groq Cloud
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"

# Fallback AI: OpenRouter (Optional)
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="anthropic/claude-3.5-sonnet"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"

# LinkedIn Developer Credentials
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_REDIRECT_URI="http://localhost:3000/api/integrations/linkedin/callback"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="your-secure-cron-secret"
```

### 4. Database Setup

Run Prisma to generate the client and initialize the database schema:

```bash
npx prisma generate
```

For Supabase, execute the migration script located at `prisma/supabase_migration.sql` directly inside the **Supabase SQL Editor**, or synchronize the schema using:

```bash
npx prisma db push
```

### 5. LinkedIn Developer Portal Setup

In your LinkedIn Developer App:

1. Under the **Products** tab, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (for Supabase user sign-in)
   - **Share on LinkedIn** (for post publishing)
2. Under the **Auth** tab, add both redirect URLs:
   - `https://your-project-id.supabase.co/auth/v1/callback` (Supabase Auth callback)
   - `http://localhost:3000/api/integrations/linkedin/callback` (Linker App publishing callback)

### 6. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
linker/
├── prisma/
│   ├── schema.prisma              # Database schema definitions
│   └── supabase_migration.sql     # Supabase SQL initialization script
├── public/
│   └── logo.jpg                   # Linker branding asset
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/                # AI generation and review endpoints
│   │   │   ├── integrations/      # LinkedIn OAuth connect and callback handlers
│   │   │   └── posts/             # Post CRUD and publishing trigger
│   │   ├── app/                   # Authenticated application workspace
│   │   │   ├── analytics/         # Post performance and reach metrics
│   │   │   ├── identity/          # Persona, tone, and audience settings
│   │   │   ├── knowledge/         # Verified technical entry repository
│   │   │   ├── schedule/          # Editorial calendar and scheduled posts
│   │   │   ├── settings/          # Account and integration management
│   │   │   ├── studio/            # Post composer and quality review
│   │   │   └── page.tsx           # Dashboard overview
│   │   ├── auth/
│   │   │   ├── callback/          # OAuth code exchange route
│   │   │   └── signin/            # Sign in with LinkedIn / Google
│   │   ├── layout.tsx             # Root layout with theme provider
│   │   └── page.tsx               # Marketing landing page
│   ├── components/                # Modular UI components (Navigation, Header, Logo)
│   ├── lib/
│   │   ├── ai/                    # Groq, OpenRouter, and quality scoring engines
│   │   ├── linkedin/              # LinkedIn REST API integration client
│   │   ├── supabase/              # Browser, server, and middleware Supabase clients
│   │   ├── auth.ts                # Session resolution utilities
│   │   └── prisma.ts              # Prisma singleton instance
│   ├── middleware.ts              # Protected route and session synchronization
│   └── styles/                    # Global CSS variables, components, and layout styles
├── .env.example                   # Environment template
├── package.json                   # Project scripts and dependencies
├── tsconfig.json                  # TypeScript compiler settings
└── README.md                      # Project documentation
```

---

## Security and Compliance Guarantees

- **Zero Unauthorized Scraping**: Operates exclusively through LinkedIn official REST APIs and OAuth 2.0 specifications.
- **Privacy by Default**: Your internal engineering notes and knowledge entries are never transmitted to public LLM training datasets.
- **Human-in-the-Loop**: Automated publishing requires manual approval or deliberate scheduling. No rogue automated bots.
- **Encrypted Token Storage**: OAuth access tokens and refresh tokens are securely stored in Supabase PostgreSQL.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
