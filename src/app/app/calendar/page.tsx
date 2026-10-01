'use client';

// src/app/app/calendar/page.tsx
// LINKER - Content Calendar

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Draft {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  idea: { title: string } | null;
  pillar: { name: string; color: string } | null;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#16A34A', SCHEDULED: '#2563EB', PUBLISHED: '#7C3AED',
  DRAFT: '#94A3B8', IN_REVIEW: '#D97806',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/studio').then(r => r.json()).then(data => {
      setDrafts(data.drafts || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function getDraftsForDay(day: number): Draft[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return drafts.filter(d => {
      const date = d.scheduledAt || d.publishedAt;
      return date && date.startsWith(dateStr);
    });
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const selectedDrafts = selectedDay ? getDraftsForDay(selectedDay) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>Content Calendar</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            View your approved and scheduled posts. Schedule posts by approving drafts in the Studio.
          </p>
        </div>
        <Link href="/app/studio" className="btn btn-primary">Open Studio →</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-4)', alignItems: 'start' }}>
        {/* ── Calendar Grid ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Month Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            <button className="btn btn-ghost" onClick={prevMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button className="btn btn-ghost" onClick={nextMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)' }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} style={{ padding: 'var(--space-2)', textAlign: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)' }}>{d}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: 'var(--space-3)', minHeight: 80, borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-muted)' }} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayDrafts = getDraftsForDay(day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;
              return (
                <div key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    padding: 'var(--space-2)', minHeight: 80, borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', background: isSelected ? 'var(--color-primary)' + '0D' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-muted)'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)', fontWeight: isToday ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                    background: isToday ? 'var(--color-primary)' : 'transparent',
                    color: isToday ? 'white' : 'var(--color-text-primary)',
                  }}>{day}</div>
                  {dayDrafts.slice(0, 2).map(d => (
                    <div key={d.id} style={{
                      fontSize: '10px', lineHeight: 1.2, padding: '2px 4px', borderRadius: 3,
                      marginBottom: 2, background: STATUS_COLORS[d.status] + '22', color: STATUS_COLORS[d.status],
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {d.idea?.title || d.content.slice(0, 20)}
                    </div>
                  ))}
                  {dayDrafts.length > 2 && <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>+{dayDrafts.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Legend */}
          <div className="card">
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>Legend</h4>
            {Object.entries({ APPROVED: 'Approved', SCHEDULED: 'Scheduled', PUBLISHED: 'Published' }).map(([s, l]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s] }} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Upcoming Approved */}
          <div className="card">
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>Approved Drafts</h4>
            {loading ? (
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading…</div>
            ) : drafts.filter(d => d.status === 'APPROVED').length === 0 ? (
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                No approved drafts. <Link href="/app/studio" style={{ color: 'var(--color-primary)' }}>Go to Studio →</Link>
              </div>
            ) : (
              drafts.filter(d => d.status === 'APPROVED').slice(0, 5).map(d => (
                <div key={d.id} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-2)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: '#16A34A', marginBottom: 2 }}>Approved</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {(d.idea?.title || d.content).slice(0, 60)}…
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Day Details */}
          {selectedDay && (
            <div className="card">
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
                {monthNames[currentMonth]} {selectedDay}
              </h4>
              {selectedDrafts.length === 0 ? (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No posts scheduled for this day.</div>
              ) : (
                selectedDrafts.map(d => (
                  <div key={d.id} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${STATUS_COLORS[d.status] || '#94A3B8'}`, background: 'var(--color-surface-muted)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: STATUS_COLORS[d.status], marginBottom: 2 }}>{d.status}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{d.content.slice(0, 80)}…</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
