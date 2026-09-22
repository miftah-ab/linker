'use client';

// src/app/app/identity/page.tsx
// LINKER — Professional Identity, Evidence State, and Voice Rules

import React, { useEffect, useState } from 'react';

export default function IdentityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Form states
  const [headline, setHeadline] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [bio, setBio] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tonePreference, setTonePreference] = useState('PROFESSIONAL');
  const [voiceRulesText, setVoiceRulesText] = useState('');
  const [bannedPhrasesText, setBannedPhrasesText] = useState('');
  const [emojiStyle, setEmojiStyle] = useState('MINIMAL');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/identity');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setHeadline(data.profile.headline || '');
            setCurrentRole(data.profile.currentRole || '');
            setCompany(data.profile.company || '');
            setIndustry(data.profile.industry || '');
            setBio(data.profile.bio || '');
            setTargetAudience(data.profile.targetAudience || '');
            setTonePreference(data.profile.tonePreference || 'PROFESSIONAL');
            setVoiceRulesText(
              Array.isArray(data.profile.voiceRules) ? data.profile.voiceRules.join('\n') : ''
            );
            setBannedPhrasesText(
              Array.isArray(data.profile.bannedPhrases) ? data.profile.bannedPhrases.join('\n') : ''
            );
            setEmojiStyle(data.profile.emojiStyle || 'MINIMAL');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(false);

    const voiceRules = voiceRulesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const bannedPhrases = bannedPhrasesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          currentRole,
          company,
          industry,
          bio,
          targetAudience,
          tonePreference,
          voiceRules,
          bannedPhrases,
          emojiStyle,
        }),
      });

      if (res.ok) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save identity:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading identity profile...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
            Professional Identity & Voice
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            The foundational context Linker uses to ensure all AI drafts sound like you and never invent false claims.
          </p>
        </div>

        {savedMessage && (
          <div className="badge badge-success" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
            ✓ Identity Profile Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* ── Core Professional Persona ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Professional Background</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Verified facts about your position and domain
              </p>
            </div>
            <span className="badge badge-primary">Evidence: Confirmed</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="field">
              <label className="label" htmlFor="currentRole">Current Role / Title</label>
              <input
                id="currentRole"
                type="text"
                className="input"
                placeholder="e.g. Staff Engineer, VP of Product, Founder"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="company">Company / Organization</label>
              <input
                id="company"
                type="text"
                className="input"
                placeholder="e.g. Acme Health or Stealth AI"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label" htmlFor="headline">LinkedIn Headline</label>
              <input
                id="headline"
                type="text"
                className="input"
                placeholder="e.g. Building resilient distributed systems | ex-AWS | Writing on infra scaling"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="industry">Industry / Domain</label>
              <input
                id="industry"
                type="text"
                className="input"
                placeholder="e.g. Distributed Systems, FinTech, B2B SaaS"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="targetAudience">Target Audience</label>
              <input
                id="targetAudience"
                type="text"
                className="input"
                placeholder="e.g. Engineering Directors, Founders, Cloud Architects"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label" htmlFor="bio">Professional Summary / Bio</label>
              <textarea
                id="bio"
                className="textarea"
                rows={3}
                placeholder="Brief summary of your track record, key technical domains, and what you build."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Voice & Tone Configuration ── */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Voice Rules & Persona Standards</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Strict boundaries that AI must follow during drafting
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <div className="field">
              <label className="label" htmlFor="tonePreference">Tone Register</label>
              <select
                id="tonePreference"
                className="select"
                value={tonePreference}
                onChange={(e) => setTonePreference(e.target.value)}
              >
                <option value="PROFESSIONAL">Professional & Objective</option>
                <option value="CONVERSATIONAL">Conversational & Candid</option>
                <option value="TECHNICAL">Deeply Technical & Analytical</option>
                <option value="AUTHORITATIVE">Authoritative Industry Expert</option>
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="emojiStyle">Emoji Usage</label>
              <select
                id="emojiStyle"
                className="select"
                value={emojiStyle}
                onChange={(e) => setEmojiStyle(e.target.value)}
              >
                <option value="NONE">Strictly None (Zero emojis)</option>
                <option value="MINIMAL">Minimal (Max 1-2 functional bullets)</option>
                <option value="MODERATE">Moderate</option>
              </select>
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label" htmlFor="voiceRules">Voice Rules (One per line)</label>
              <textarea
                id="voiceRules"
                className="textarea"
                rows={4}
                placeholder={"Write in first person from actual hands-on engineering experience\nKeep paragraphs under 3 sentences\nFocus on trade-offs and practical architectural decisions\nNever use hollow buzzwords"}
                value={voiceRulesText}
                onChange={(e) => setVoiceRulesText(e.target.value)}
              />
              <span className="field-hint">Rules injected into the Groq LLM prompt system instructions.</span>
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label" htmlFor="bannedPhrases">Banned Phrases & Cringe Filter (One per line)</label>
              <textarea
                id="bannedPhrases"
                className="textarea"
                rows={4}
                placeholder={"I am thrilled to announce\nHumbled and honored\nAgree?\nThoughts?\nSuper pumped\nGame-changer"}
                value={bannedPhrasesText}
                onChange={(e) => setBannedPhrasesText(e.target.value)}
              />
              <span className="field-hint">Any draft generated with these phrases will be automatically blocked or flagged during review.</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
            {saving ? (
              <>
                <span className="spinner spinner-sm" />
                Saving Identity...
              </>
            ) : (
              'Save Identity Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
