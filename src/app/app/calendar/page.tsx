'use client';

// src/app/app/calendar/page.tsx
// LINKER - Content Calendar

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';

interface Draft {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  idea: { title: string } | null;
  pillar: { name: string; color: string } | null;
}

const DAYS_OF_WEEK = [
  { full: 'Sun', short: 'S' },
  { full: 'Mon', short: 'M' },
  { full: 'Tue', short: 'T' },
  { full: 'Wed', short: 'W' },
  { full: 'Thu', short: 'T' },
  { full: 'Fri', short: 'F' },
  { full: 'Sat', short: 'S' },
];

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#16A34A',
  SCHEDULED: '#2563EB',
  PUBLISHED: '#7C3AED',
  DRAFT: '#94A3B8',
  IN_REVIEW: '#D97806',
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
    fetch('/api/studio')
      .then((r) => r.json())
      .then((data) => {
        setDrafts(data.drafts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function getDraftsForDay(day: number): Draft[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return drafts.filter((d) => {
      const date = d.scheduledAt || d.publishedAt;
      return date && date.startsWith(dateStr);
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const selectedDrafts = selectedDay ? getDraftsForDay(selectedDay) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2_5)', marginBottom: 'var(--space-1)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarDays size={18} strokeWidth={2} />
            </div>
            <h1
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Content Calendar
            </h1>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Schedule and visualize approved posts across your strategic publishing cadence.
          </p>
        </div>
        <Link href="/app/studio" className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
          <span>Open Studio</span>
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>

      <div className="calendar-layout">
        {/* ── Calendar Grid ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Month Navigation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <button
              className="btn btn-ghost btn-icon-sm"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <h2
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              className="btn btn-ghost btn-icon-sm"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-muted)',
            }}
          >
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d.full}
                style={{
                  padding: 'var(--space-2) var(--space-1)',
                  textAlign: 'center',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span className="hide-mobile">{d.full}</span>
                <span className="show-mobile">{d.short}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  minHeight: 74,
                  borderRight: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-surface-muted)',
                  opacity: 0.5,
                }}
              />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayDrafts = getDraftsForDay(day);
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    padding: 'var(--space-1_5)',
                    minHeight: 74,
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                      : 'transparent',
                    transition: 'background-color var(--transition-fast)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        'var(--color-surface-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 3,
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: isToday ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                      background: isToday ? 'var(--color-primary)' : 'transparent',
                      color: isToday ? '#fff' : 'var(--color-text-primary)',
                    }}
                  >
                    {day}
                  </div>

                  {/* Desktop draft pills */}
                  <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayDrafts.slice(0, 2).map((d) => (
                      <div
                        key={d.id}
                        style={{
                          fontSize: '10px',
                          lineHeight: 1.25,
                          padding: '2px 5px',
                          borderRadius: 'var(--radius-sm)',
                          background: `${STATUS_COLORS[d.status] || '#94A3B8'}18`,
                          color: STATUS_COLORS[d.status] || 'var(--color-text-secondary)',
                          border: `1px solid ${STATUS_COLORS[d.status] || '#94A3B8'}33`,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {d.idea?.title || d.content.slice(0, 24)}
                      </div>
                    ))}
                    {dayDrafts.length > 2 && (
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                        +{dayDrafts.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Mobile draft dots */}
                  {dayDrafts.length > 0 && (
                    <div
                      className="show-mobile"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        marginTop: 2,
                      }}
                    >
                      {dayDrafts.slice(0, 3).map((d) => (
                        <span
                          key={d.id}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: STATUS_COLORS[d.status] || 'var(--color-primary)',
                          }}
                        />
                      ))}
                      {dayDrafts.length > 3 && (
                        <span style={{ fontSize: '8px', color: 'var(--color-text-muted)' }}>
                          +{dayDrafts.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Legend */}
          <div className="card">
            <h3
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--space-3)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Status Legend
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                { status: 'APPROVED', label: 'Approved & Ready', icon: <CheckCircle2 size={13} color="#16A34A" /> },
                { status: 'SCHEDULED', label: 'Scheduled in Queue', icon: <Clock size={13} color="#2563EB" /> },
                { status: 'PUBLISHED', label: 'Published to LinkedIn', icon: <Sparkles size={13} color="#7C3AED" /> },
              ].map(({ status, label, icon }) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {icon}
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDay && (
            <div className="card" style={{ borderLeft: '3px solid var(--color-primary)' }}>
              <h3
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {monthNames[currentMonth]} {selectedDay}
              </h3>
              {selectedDrafts.length === 0 ? (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
                  No posts scheduled for this day. Click another day or open Studio to schedule.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {selectedDrafts.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: 'var(--space-2_5)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `3px solid ${STATUS_COLORS[d.status] || '#94A3B8'}`,
                        background: 'var(--color-surface-muted)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: STATUS_COLORS[d.status] || 'var(--color-text-primary)',
                          marginBottom: 3,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {d.status}
                      </div>
                      <p
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {d.content.slice(0, 100)}…
                      </p>
                      <Link
                        href={`/app/studio?draftId=${d.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '11px',
                          color: 'var(--color-primary)',
                          marginTop: 'var(--space-1_5)',
                          textDecoration: 'none',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        <span>Edit in Studio</span>
                        <ArrowRight size={12} strokeWidth={2} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Approved */}
          <div className="card">
            <h3
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                marginBottom: 'var(--space-3)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Approved Drafts Queue
            </h3>
            {loading ? (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Loading drafts…
              </div>
            ) : drafts.filter((d) => d.status === 'APPROVED').length === 0 ? (
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                No approved drafts yet.{' '}
                <Link href="/app/studio" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Go to Studio →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {drafts
                  .filter((d) => d.status === 'APPROVED')
                  .slice(0, 5)
                  .map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: 'var(--space-2_5)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1_5)',
                          fontSize: '11px',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: '#16A34A',
                          marginBottom: 3,
                        }}
                      >
                        <CheckCircle2 size={12} strokeWidth={2} />
                        <span>Approved</span>
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {(d.idea?.title || d.content).slice(0, 70)}…
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
