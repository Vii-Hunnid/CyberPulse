'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, Eye, ScanLine } from 'lucide-react';

const NAV = [
  { href: '/dashboard',              label: 'OVERVIEW',  Icon: LayoutDashboard },
  { href: '/dashboard/scan/new',     label: 'NEW SCAN',  Icon: ScanLine },
  { href: '/dashboard/underwriting', label: 'INSURANCE', Icon: Shield },
  { href: '/dashboard/darkweb',      label: 'DARK WEB',  Icon: Eye },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '9px 12px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '.5px',
              textDecoration: 'none',
              color: active ? '#0ea5e9' : '#475569',
              background: active ? 'rgba(14,165,233,.08)' : 'transparent',
              borderLeft: `2px solid ${active ? '#0ea5e9' : 'transparent'}`,
              transition: 'all .15s',
            }}
          >
            <Icon size={14} strokeWidth={active ? 2 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
