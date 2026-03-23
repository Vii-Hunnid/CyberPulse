import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CyberPulse — Free Cyber Security Scanner for SA Businesses',
  description:
    'Instantly scan your business domain for security vulnerabilities, dark web breaches, and insurance readiness. Free. No account required.',
  openGraph: {
    title: 'CyberPulse — Free Cyber Security Scanner',
    description: 'Instantly scan your business domain. Free. No account required.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
