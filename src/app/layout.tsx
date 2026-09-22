// src/app/layout.tsx
// LINKER — Root layout

import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/components.css';
import '@/styles/layout.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Linker — Your professional presence, intentionally built.',
    template: '%s | Linker',
  },
  description:
    'Linker is an AI-powered professional presence management platform. Turn your real knowledge, projects, and experiences into strategic LinkedIn content.',
  keywords: [
    'LinkedIn content',
    'professional presence',
    'content strategy',
    'AI writing',
    'knowledge management',
    'professional branding',
  ],
  authors: [{ name: 'Linker' }],
  creator: 'Linker',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://linker.app',
    siteName: 'Linker',
    title: 'Linker — Your professional presence, intentionally built.',
    description:
      'Turn your real knowledge, projects, and experiences into strategic LinkedIn content.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linker — Your professional presence, intentionally built.',
    description:
      'Turn your real knowledge, projects, and experiences into strategic LinkedIn content.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32' },
      { url: '/favicon-16.png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#080D18' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
