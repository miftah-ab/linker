// src/app/page.tsx
// LINKER — Landing Page

import Link from 'next/link';
import { LinkerWordmark, LinkerMark } from '@/components/Logo';

export const metadata = {
  title: 'Linker — Your professional presence, intentionally built',
  description:
    'Linker turns your real projects, knowledge, and expertise into credible LinkedIn content. Grounded AI drafting with mandatory human review.',
};

// Feature icon helper
function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="feature-icon" aria-hidden="true">
      {children}
    </div>
  );
}

// Trust check icon
function CheckIcon() {
  return (
    <svg
      className="trust-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="landing-root">

      {/* ── Navigation ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-nav-logo" aria-label="Linker home">
            <LinkerMark size={24} />
            <span className="landing-nav-wordmark">Linker</span>
          </Link>
          <nav className="landing-nav-actions" aria-label="Site navigation">
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-eyebrow">
          LinkedIn Presence Engine
        </div>
        <h1 className="hero-title" id="hero-heading">
          Your professional presence,{' '}
          <span className="hero-title-accent">intentionally built.</span>
        </h1>
        <p className="hero-subtitle">
          Turn your real projects, working journal, and domain knowledge
          into credible LinkedIn content — drafted by AI, always reviewed by you.
        </p>
        <div className="hero-actions">
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Start building your presence
          </Link>
          <Link href="/auth/signin" className="btn btn-secondary btn-lg">
            Open workspace
          </Link>
        </div>
        <p className="hero-note">
          No invented metrics &bull; No automated posting &bull; Human review required
        </p>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section section-alt" aria-labelledby="method-heading">
        <div className="landing-section-inner">
          <p className="section-eyebrow">The Method</p>
          <h2 className="section-heading" id="method-heading">
            From raw experience to published expertise
          </h2>
          <p className="section-subheading">
            Generic AI invents clichés. Linker synthesizes your actual work through a connected four-stage workflow.
          </p>

          <div className="workflow-steps">
            {[
              {
                n: '01',
                title: 'Identity & Knowledge',
                desc: 'Define your verified domain pillars and professional voice. Build a knowledge base from real work — architecture decisions, metrics, and lessons learned.',
              },
              {
                n: '02',
                title: 'Journal & Projects',
                desc: 'Log work as it happens. Document project milestones, breakthroughs, and observations in a private, searchable journal.',
              },
              {
                n: '03',
                title: 'Ideas & Research',
                desc: 'Capture content ideas tied to your real expertise. Pull in supporting research and evidence to ground each post in substance.',
              },
              {
                n: '04',
                title: 'Draft, Review & Publish',
                desc: 'AI generates a contextual first draft citing your knowledge entries. You review, edit, and approve — then publish directly via the official LinkedIn API.',
              },
            ].map(step => (
              <div className="workflow-step" key={step.n}>
                <div className="workflow-step-number" aria-hidden="true">{step.n}</div>
                <h3 className="workflow-step-title">{step.title}</h3>
                <p className="workflow-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section" aria-labelledby="features-heading">
        <div className="landing-section-inner">
          <p className="section-eyebrow">Platform Capabilities</p>
          <h2 className="section-heading" id="features-heading">
            Built for professionals who care about their reputation
          </h2>
          <p className="section-subheading">
            Every feature is designed to protect your credibility while
            compounding the reach of your real expertise.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </FeatureIcon>
              <h3 className="feature-card-title">Evidence-Based Identity</h3>
              <p className="feature-card-desc">
                Professional profile with explicit evidence states: Confirmed, AI Suggestion, and Unverified. AI never presents an assumption as fact.
              </p>
            </div>

            <div className="feature-card">
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="12" y2="17" />
                </svg>
              </FeatureIcon>
              <h3 className="feature-card-title">Work Journal</h3>
              <p className="feature-card-desc">
                Log engineering breakthroughs, product decisions, and lessons as they happen. Private journal notes become high-signal public insight.
              </p>
            </div>

            <div className="feature-card">
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </FeatureIcon>
              <h3 className="feature-card-title">Quality Review Engine</h3>
              <p className="feature-card-desc">
                Built-in checks flag generic thought-leader tropes, unsupported metrics, engagement-bait openers, and content that doesn&apos;t match your voice.
              </p>
            </div>

            <div className="feature-card">
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </FeatureIcon>
              <h3 className="feature-card-title">Grounded Knowledge Base</h3>
              <p className="feature-card-desc">
                Structured knowledge entries the AI cites directly during drafting. Your content is always traceable back to a real source.
              </p>
            </div>

            <div className="feature-card">
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </FeatureIcon>
              <h3 className="feature-card-title">Editorial Calendar</h3>
              <p className="feature-card-desc">
                Plan content across your strategic pillars. Identify topic gaps, manage cadence, and maintain consistency without burnout.
              </p>
            </div>

            <div className="feature-card">
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
              </FeatureIcon>
              <h3 className="feature-card-title">Official LinkedIn API</h3>
              <p className="feature-card-desc">
                OAuth 2.0 and the official Member API only. No browser automation, no unofficial cookies, and zero risk to your LinkedIn account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="landing-section trust-section" aria-labelledby="principles-heading">
        <div className="landing-section-inner">
          <p className="section-eyebrow">Professional Standards</p>
          <h2 className="section-heading" id="principles-heading">
            Built on principles of professional integrity
          </h2>

          <div className="trust-grid">
            {[
              {
                title: 'No invented facts',
                desc: 'AI is explicitly instructed to refuse fabricating statistics, achievements, or project results not found in your workspace.',
              },
              {
                title: 'Mandatory human approval',
                desc: 'Nothing publishes without your explicit review and sign-off. Every draft goes through an approval workflow.',
              },
              {
                title: 'Honest analytics',
                desc: 'No vanity scores or predictive projections. Real post history and actual engagement data from the LinkedIn API.',
              },
              {
                title: 'Your data, your control',
                desc: 'Journals, unreleased projects, and private knowledge are never used to train public models or shared externally.',
              },
            ].map(item => (
              <div className="trust-item" key={item.title}>
                <CheckIcon />
                <div>
                  <h3 className="trust-item-title">{item.title}</h3>
                  <p className="trust-item-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <div className="cta-inner">
          <p className="section-eyebrow" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            Get started
          </p>
          <h2 className="section-heading" id="cta-heading" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
            Ready to share your real expertise?
          </h2>
          <p className="section-subheading" style={{ textAlign: 'center', maxWidth: '100%', marginBottom: 'var(--space-8)' }}>
            Build an enduring professional presence grounded in your actual work — not AI-generated noise.
          </p>
          <div className="hero-actions">
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Create your account
            </Link>
            <Link href="/auth/signin" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2_5)' }}>
            <LinkerMark size={18} />
            <span className="landing-footer-copy">
              &copy; {new Date().getFullYear()} Linker
            </span>
          </div>
          <nav className="landing-footer-links" aria-label="Footer navigation">
            <Link href="/auth/signin" className="landing-footer-link">Sign in</Link>
            <Link href="/auth/signup" className="landing-footer-link">Register</Link>
          </nav>
        </div>
      </footer>

    </div>
  );
}
