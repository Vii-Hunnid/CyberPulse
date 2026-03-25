'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Eye, Search } from 'lucide-react';

interface Breach {
  source: string;
  breachDate: string;
  dataClasses: string[];
  isVerified: boolean;
}

export default function DarkWebPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [checked, setChecked] = useState(false);

  async function checkEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setChecked(false);
    const res = await fetch('/api/darkweb/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setBreaches(data.breaches ?? []);
    setChecked(true);
    setLoading(false);
  }

  const isCritical = (dc: string[]) =>
    dc.some((d) => d.toLowerCase().includes('password') || d.toLowerCase().includes('financial'));

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
        .dw-input:focus { border-color: rgba(14,165,233,.5) !important; outline: none; box-shadow: 0 0 0 3px rgba(14,165,233,.08); }
        .dw-input { transition: border-color .2s, box-shadow .2s; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1.5, marginBottom: 4 }}>[ DARK WEB MONITOR ]</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Dark Web Monitor</h2>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Check if your business email has appeared in known data breaches</p>
      </div>

      {/* Search form */}
      <div style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #dde3ec', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
        <form onSubmit={checkEmail} style={{ display: 'flex', gap: 0, overflow: 'hidden', border: '1px solid #dde3ec', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 14, background: '#f8fafc', borderRight: '1px solid #dde3ec', flexShrink: 0 }}>
            <Eye size={15} color="#94a3b8" strokeWidth={1.5} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@yourbusiness.co.za"
            className="dw-input mono"
            style={{ flex: 1, padding: '12px 14px', background: '#f8fafc', border: 'none', color: '#0f172a', fontSize: 13, letterSpacing: '.3px' }}
          />
          <button type="submit" disabled={loading} className="mono" style={{ padding: '12px 22px', background: loading ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: loading ? 'wait' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, letterSpacing: .5 }}>
            <Search size={13} strokeWidth={2} />
            {loading ? 'CHECKING...' : 'CHECK EMAIL'}
          </button>
        </form>
      </div>

      {/* Results */}
      {checked && (
        breaches.length === 0 ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dcfce7', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CheckCircle2 size={22} color="#10b981" strokeWidth={1.5} />
            </div>
            <p className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 6 }}>NO BREACHES FOUND</p>
            <p style={{ fontSize: 13, color: '#16a34a' }}>This email has not appeared in any known data breaches.</p>
          </div>
        ) : (
          <div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={18} color="#ef4444" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <p className="mono" style={{ color: '#dc2626', fontSize: 12, fontWeight: 700, letterSpacing: .5 }}>
                {breaches.length} BREACH{breaches.length > 1 ? 'ES' : ''} DETECTED FOR THIS ADDRESS
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {breaches.map((breach, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: 10, padding: '18px 20px', border: `1px solid ${isCritical(breach.dataClasses) ? '#fecaca' : '#dde3ec'}`, borderTop: `3px solid ${isCritical(breach.dataClasses) ? '#ef4444' : '#dde3ec'}`, boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{breach.source}</h3>
                      <p className="mono" style={{ fontSize: 11, color: '#94a3b8', letterSpacing: .5 }}>BREACH DATE: {breach.breachDate}</p>
                    </div>
                    {isCritical(breach.dataClasses) && (
                      <span className="mono" style={{ fontSize: 9, fontWeight: 700, background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: 3, letterSpacing: 1, flexShrink: 0 }}>CRITICAL</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {breach.dataClasses.map((dc, j) => (
                      <span key={j} className="mono" style={{ fontSize: 10, padding: '3px 9px', borderRadius: 4, background: isCritical([dc]) ? '#fef2f2' : '#f0f4f8', color: isCritical([dc]) ? '#dc2626' : '#64748b', border: `1px solid ${isCritical([dc]) ? '#fecaca' : '#dde3ec'}`, letterSpacing: .3 }}>
                        {dc}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
