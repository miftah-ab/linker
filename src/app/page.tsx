// src/app/page.tsx
// LINKER — Landing Page (redesigned: modern dark, glassmorphism, animated)

import Link from 'next/link';
import { LinkerMark } from '@/components/Logo';
import {
  ShieldCheck,
  NotebookPen,
  Sparkles,
  BookOpen,
  CalendarDays,
  Share2,
  ArrowRight,
  Shield,
  FileCheck,
  Lock,
  BarChart3,
  CheckCircle2,
  Zap,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'Linker — Your professional presence, intentionally built',
  description:
    'Linker turns your real projects, knowledge, and expertise into credible LinkedIn content. Grounded AI drafting with mandatory human review.',
};

const features = [
  {
    icon: ShieldCheck,
    title: 'Evidence-Based Identity',
    desc: 'Professional profile with explicit evidence states: Confirmed, AI Suggestion, and Unverified. AI never presents an assumption as fact.',
    color: '#6366f1',
  },
  {
    icon: NotebookPen,
    title: 'Work Journal',
    desc: 'Log engineering breakthroughs, product decisions, and lessons as they happen. Private journal notes become high-signal public insight.',
    color: '#0ea5e9',
  },
  {
    icon: Sparkles,
    title: 'Quality Review Engine',
    desc: 'Built-in checks flag generic thought-leader tropes, unsupported metrics, and content that doesn\'t match your voice.',
    color: '#f59e0b',
  },
  {
    icon: BookOpen,
    title: 'Grounded Knowledge Base',
    desc: 'Structured knowledge entries the AI cites directly during drafting. Your content is always traceable back to a real source.',
    color: '#10b981',
  },
  {
    icon: CalendarDays,
    title: 'Editorial Calendar',
    desc: 'Plan content across your strategic pillars. Identify topic gaps, manage cadence, and maintain consistency without burnout.',
    color: '#f43f5e',
  },
  {
    icon: Share2,
    title: 'Official LinkedIn API',
    desc: 'OAuth 2.0 and the official Member API only. No browser automation, no unofficial cookies, zero risk to your account.',
    color: '#8b5cf6',
  },
];

const steps = [
  { n: '01', title: 'Identity & Knowledge', desc: 'Define your verified domain pillars and professional voice. Build a knowledge base from real work — architecture decisions, metrics, and lessons.', color: '#6366f1' },
  { n: '02', title: 'Journal & Projects', desc: 'Log work as it happens. Document project milestones, breakthroughs, and observations in a private, searchable journal.', color: '#0ea5e9' },
  { n: '03', title: 'Ideas & Research', desc: 'Capture content ideas tied to your real expertise. Pull in supporting research and evidence to ground each post in substance.', color: '#10b981' },
  { n: '04', title: 'Draft, Review & Publish', desc: 'AI generates a contextual first draft citing your knowledge entries. You review, edit, approve — then publish via the official LinkedIn API.', color: '#f59e0b' },
];

const principles = [
  { icon: FileCheck, title: 'No invented facts', desc: 'AI is explicitly instructed to refuse fabricating statistics, achievements, or project results not found in your workspace.' },
  { icon: ShieldCheck, title: 'Mandatory human approval', desc: 'Nothing publishes without your explicit review and sign-off. Every draft goes through an approval workflow.' },
  { icon: BarChart3, title: 'Honest analytics', desc: 'No vanity scores or predictive projections. Real post history and actual engagement data from the LinkedIn API.' },
  { icon: Lock, title: 'Your data, your control', desc: 'Journals, unreleased projects, and private knowledge are never used to train public models or shared externally.' },
];

export default function HomePage() {
  return (
    <div className="landing-root">

      {/* ── Navigation ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-nav-logo" aria-label="Linker home">
            <LinkerMark size={26} />
            <span className="landing-nav-wordmark">Linker</span>
          </Link>
          <nav className="landing-nav-actions" aria-label="Site navigation">
            <Link href="/auth/signin" className="nav-link">Sign in</Link>
            <Link href="/auth/signup" className="nav-cta">
              Get started <ArrowRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-heading">
        {/* Background orbs */}
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-badge">
            <Shield size={12} strokeWidth={2.5} />
            <span>LinkedIn Presence Engine</span>
          </div>

          <h1 className="hero-title" id="hero-heading">
            Your professional presence,{' '}
            <span className="hero-title-gradient">intentionally built.</span>
          </h1>

          <p className="hero-subtitle">
            Turn your real projects, working journal, and domain knowledge
            into credible LinkedIn content — drafted by AI, always reviewed by you.
          </p>

          <div className="hero-actions">
            <Link href="/auth/signup" className="btn-hero-primary">
              <Zap size={16} />
              Start building your presence
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/signin" className="btn-hero-ghost">
              Open workspace
            </Link>
          </div>

          <div className="hero-trust-row">
            {['No invented metrics', 'No automated posting', 'Human review required'].map(t => (
              <span key={t} className="hero-trust-pill">
                <CheckCircle2 size={12} />
                {t}
              </span>
            ))}
          </div>

          {/* Dashboard preview card */}
          <div className="hero-preview" aria-hidden="true">
            <div className="hero-preview-bar">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-url">linker-studio.vercel.app/app</span>
            </div>
            <div className="hero-preview-content">
              <div className="preview-sidebar">
                {['Dashboard', 'Studio', 'Ideas', 'Journal', 'Calendar'].map(item => (
                  <div key={item} className={`preview-nav-item ${item === 'Studio' ? 'active' : ''}`}>
                    <div className="preview-nav-dot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="preview-main">
                <div className="preview-card-row">
                  {['Draft ready', 'Reviewed', 'Published'].map((s, i) => (
                    <div key={s} className="preview-stat-card">
                      <div className="preview-stat-num" style={{ color: ['#6366f1','#10b981','#0ea5e9'][i] }}>
                        {['3', '12', '47'][i]}
                      </div>
                      <div className="preview-stat-label">{s}</div>
                    </div>
                  ))}
                </div>
                <div className="preview-draft-card">
                  <div className="preview-draft-header">
                    <span className="preview-draft-badge">AI Draft</span>
                    <span className="preview-draft-status">Awaiting review</span>
                  </div>
                  <div className="preview-draft-lines">
                    <div className="preview-line w-full" />
                    <div className="preview-line w-3/4" />
                    <div className="preview-line w-1/2" />
                  </div>
                  <div className="preview-draft-actions">
                    <div className="preview-btn preview-btn-approve">Approve</div>
                    <div className="preview-btn preview-btn-edit">Edit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <div className="social-strip">
        <div className="social-strip-inner">
          {[
            { icon: Users, label: 'Built for professionals' },
            { icon: Shield, label: 'No automation risk' },
            { icon: Sparkles, label: 'AI + human review' },
            { icon: Share2, label: 'Official LinkedIn API' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="social-pill">
              <Icon size={14} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="section-steps" aria-labelledby="method-heading">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">The Method</span>
            <h2 id="method-heading">From raw experience to published expertise</h2>
            <p>Generic AI invents clichés. Linker synthesizes your actual work through a connected four-stage workflow.</p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.n}>
                <div className="step-number" style={{ background: step.color + '22', color: step.color, borderColor: step.color + '44' }}>
                  {step.n}
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <div className="step-line" style={{ background: step.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-features" aria-labelledby="features-heading">
        <div className="section-inner">
          <div className="section-header">
            <span className="eyebrow">Platform Capabilities</span>
            <h2 id="features-heading">Built for professionals who care about their reputation</h2>
            <p>Every feature is designed to protect your credibility while compounding the reach of your real expertise.</p>
          </div>

          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon-wrap" style={{ background: color + '18', borderColor: color + '30' }}>
                  <Icon size={20} strokeWidth={1.75} style={{ color }} />
                </div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ── */}
      <section className="section-principles" aria-labelledby="principles-heading">
        <div className="section-inner">
          <div className="principles-layout">
            <div className="principles-left">
              <span className="eyebrow">Professional Standards</span>
              <h2 id="principles-heading">Built on principles of professional integrity</h2>
              <p>Every design decision starts with one question: does this protect or compromise your professional reputation?</p>
              <Link href="/auth/signup" className="btn-hero-primary" style={{ marginTop: '2rem', alignSelf: 'flex-start' }}>
                Get started free <ArrowRight size={15} />
              </Link>
            </div>
            <div className="principles-right">
              {principles.map(({ icon: Icon, title, desc }) => (
                <div className="principle-item" key={title}>
                  <div className="principle-icon">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="principle-title">{title}</h3>
                    <p className="principle-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-cta" aria-labelledby="cta-heading">
        <div className="cta-orb cta-orb-1" aria-hidden="true" />
        <div className="cta-orb cta-orb-2" aria-hidden="true" />
        <div className="cta-inner">
          <span className="eyebrow" style={{ textAlign: 'center' }}>Get started</span>
          <h2 id="cta-heading" className="cta-heading">Ready to share your real expertise?</h2>
          <p className="cta-sub">
            Build an enduring professional presence grounded in your actual work — not AI-generated noise.
          </p>
          <div className="cta-actions">
            <Link href="/auth/signup" className="btn-hero-primary btn-xl">
              <Zap size={18} />
              Create your account
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/signin" className="btn-hero-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <LinkerMark size={20} />
            <span>© {new Date().getFullYear()} Linker</span>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/auth/signin" className="footer-link">Sign in</Link>
            <Link href="/auth/signup" className="footer-link">Register</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
