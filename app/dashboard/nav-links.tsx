'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, Eye } from 'lucide-react';

const NAV = [
  { href: '/dashboard',              label: 'Overview',  Icon: LayoutDashboard },
  { href: '/dashboard/underwriting', label: 'Insurance', Icon: Shield },
  { href: '/dashboard/darkweb',      label: 'Dark Web',  Icon: Eye },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              textDecoration: 'none',
              color: active ? '#00d4ff' : '#8892a4',
              background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
              borderLeft: `2px solid ${active ? '#00d4ff' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <Icon size={15} strokeWidth={active ? 2 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
