// src/app/page.tsx
// LINKER - Production Landing Page

import Link from 'next/link';
import { LogoWordmark, LogoMark } from '@/components/Logo';

export default function HomePage() {
  return (
    <div className="landing-root">
      {/* ── Navigation ────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-nav-logo" aria-label="Linker Home">
            <LogoWordmark size={32} />
          </Link>
          <div className="landing-nav-actions">
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="badge badge-neutral">LINKEDIN PRESENCE ENGINE</span>
          <span>Grounded in your real work</span>
        </div>
        <h1 className="hero-title">
          Build a serious professional presence{' '}
          <span className="hero-title-accent">without the cringe.</span>
        </h1>
        <p className="hero-subtitle">
          Turn your real projects, knowledge base, working journal, and domain expertise
          into credible LinkedIn leadership. Powered by Groq AI grounded exclusively in your facts.
        </p>
        <div className="hero-actions">
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Start Building Presence
          </Link>
          <Link href="/auth/signin" className="btn btn-secondary btn-lg">
            Open Workspace
          </Link>
        </div>
        <p className="hero-note">
          No fake virality tactics &bull; No automated scraping &bull; Strict human-in-the-loop review
        </p>
      </section>

      {/* ── How It Works (Connected Workflow) ──────────────────── */}
      <section className="landing-section section-alt">
        <div className="landing-section-inner">
          <div className="section-eyebrow">The Method</div>
          <h2 className="section-heading">How Linker transforms reality into reach</h2>
          <p className="section-subheading">
            Generic AI invents metrics and clichés. Linker synthesizes your actual expertise through a connected 4-stage pipeline.
          </p>

          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="workflow-step-number">01</div>
              <h3 className="workflow-step-title">Identity & Evidence</h3>
              <p className="workflow-step-desc">
                Define your verified domain pillars, voice rules, and past roles. Linker clearly tags confirmed facts versus assumptions.
              </p>
            </div>

            <div className="workflow-step">
              <div className="workflow-step-number">02</div>
              <h3 className="workflow-step-title">Knowledge & Journal</h3>
              <p className="workflow-step-desc">
                Capture work notes, project milestones, verified metrics, and technical insights as they actually happen.
              </p>
            </div>

            <div className="workflow-step">
              <div className="workflow-step-number">03</div>
              <h3 className="workflow-step-title">Contextual AI Studio</h3>
              <p className="workflow-step-desc">
                Groq Llama 3.3 drafts targeted posts citing your explicit knowledge entries. Automated quality checks catch generic hype before you publish.
              </p>
            </div>

            <div className="workflow-step">
              <div className="workflow-step-number">04</div>
              <h3 className="workflow-step-title">Audited Publishing</h3>
              <p className="workflow-step-desc">
                Review diffs, approve content explicitly, and schedule directly via the official LinkedIn API. Every post has a complete audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────────── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <div className="section-eyebrow">Platform Capabilities</div>
          <h2 className="section-heading">Designed for leaders, engineers, and specialists</h2>
          <p className="section-subheading">
            Every feature is engineered to protect your professional reputation while compounding your impact.
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>
              </div>
              <h3 className="feature-card-title">Evidence-Based Identity</h3>
              <p className="feature-card-desc">
                Profiles with evidence states: Confirmed, AI Suggestion, and Unverified. We never let AI present unverified assumptions as fact.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M6 6h10M6 10h10"/></svg>
              </div>
              <h3 className="feature-card-title">Live Project Journal</h3>
              <p className="feature-card-desc">
                Log real engineering breakthroughs, product decisions, and learnings. Turn private journal notes into high-signal public thought leadership.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="feature-card-title">Dual-Engine AI Reliability</h3>
              <p className="feature-card-desc">
                Lightning-fast Groq LLaMA 3.3 70B primary drafting with automatic OpenRouter fallback. Zero downtime, maximum intelligence.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <h3 className="feature-card-title">Cringe & Cliché Detection</h3>
              <p className="feature-card-desc">
                Built-in quality engine flags generic thought-leader tropes, unsupported metrics, repetitive openings, and engagement-bait formatting.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 className="feature-card-title">Strategic Content Calendar</h3>
              <p className="feature-card-desc">
                Organize drafts across your strategic pillars. Plan cadence, identify topic gaps, and maintain consistency without burnout.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </div>
              <h3 className="feature-card-title">Official LinkedIn Integration</h3>
              <p className="feature-card-desc">
                100% compliant OAuth 2.0 and official Member API. No risky headless browsers, no unofficial cookies, and zero risk to your profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & Standards Section ─────────────────────────── */}
      <section className="landing-section trust-section">
        <div className="landing-section-inner">
          <div className="section-eyebrow">Ethical Standards</div>
          <h2 className="section-heading">Built on principles of professional integrity</h2>
          
          <div className="trust-grid">
            <div className="trust-item">
              <svg className="trust-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="trust-item-title">Zero Ghost-Invented Facts</h4>
                <p className="trust-item-desc">We explicitly prompt AI models to refuse fabricating stats, achievements, or project results.</p>
              </div>
            </div>

            <div className="trust-item">
              <svg className="trust-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="trust-item-title">Mandatory Human Sign-off</h4>
                <p className="trust-item-desc">Nothing ever posts without your explicit review and approval. You are always in control.</p>
              </div>
            </div>

            <div className="trust-item">
              <svg className="trust-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="trust-item-title">Honest Analytics Only</h4>
                <p className="trust-item-desc">No vanity scores or fake projections. Real post histories and actual engagement API data.</p>
              </div>
            </div>

            <div className="trust-item">
              <svg className="trust-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="trust-item-title">Privacy-First Data Ownership</h4>
                <p className="trust-item-desc">Your journals, unreleased projects, and private IP are securely stored and never used to train public models.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ────────────────────────────────────── */}
      <section className="cta-section">
        <div className="landing-section-inner">
          <h2 className="section-heading">Ready to share your real expertise?</h2>
          <p className="section-subheading" style={{ margin: '0 auto var(--space-8)' }}>
            Join professionals building enduring career leverage through authentic, high-signal presence.
          </p>
          <div className="hero-actions">
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Create Your Linker Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <LogoMark size={20} />
            <span className="landing-footer-copy">
              &copy; {new Date().getFullYear()} LINKER. Professional Presence Architecture.
            </span>
          </div>
          <div className="landing-footer-links">
            <Link href="/auth/signin" className="landing-footer-link">Sign In</Link>
            <Link href="/auth/signup" className="landing-footer-link">Register</Link>
            <Link href="/app" className="landing-footer-link">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
