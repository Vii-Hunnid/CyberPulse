'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

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

  const hasPasswordOrFinancial = (dc: string[]) =>
    dc.some((d) => d.toLowerCase().includes('password') || d.toLowerCase().includes('financial'));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Dark Web Monitor</h2>
      <p className="mb-8" style={{ color: '#8892a4' }}>
        Check if your business email addresses have appeared in data breaches
      </p>

      <form onSubmit={checkEmail} className="flex gap-3 mb-8">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="email@yourbusiness.co.za"
          className="flex-1 rounded px-4 py-3 text-white"
          style={{ background: '#0f1729', border: '1px solid #1a2540' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded font-semibold"
          style={{ background: '#00d4ff', color: '#0a0f1e', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Checking...' : 'Monitor Email'}
        </button>
      </form>

      {checked && (
        <div>
          {breaches.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: '#0d2e1a', border: '1px solid #00ff8833' }}>
              <div className="flex justify-center mb-4"><CheckCircle2 size={40} color="#00ff88" strokeWidth={1.5} /></div>
              <p className="text-lg font-semibold" style={{ color: '#00ff88' }}>No breaches found</p>
              <p className="mt-2 text-sm" style={{ color: '#8892a4' }}>This email address has not appeared in known data breaches.</p>
            </div>
          ) : (
            <div>
              <div className="rounded-xl p-4 mb-6 flex items-center gap-4" style={{ background: '#2d0f1a', border: '1px solid #ff336633' }}>
                <AlertTriangle size={22} color="#ff3366" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <p style={{ color: '#ff3366' }}>{breaches.length} breach{breaches.length > 1 ? 'es' : ''} detected for this email address</p>
              </div>

              <div className="space-y-4">
                {breaches.map((breach, i) => (
                  <div key={i} className="rounded-xl p-6" style={{ background: '#0f1729', border: `1px solid ${hasPasswordOrFinancial(breach.dataClasses) ? '#ff336633' : '#1a2540'}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{breach.source}</h3>
                        <p className="text-sm mt-1" style={{ color: '#8892a4' }}>Breach date: {breach.breachDate}</p>
                      </div>
                      {hasPasswordOrFinancial(breach.dataClasses) && (
                        <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#ff3366', color: '#fff' }}>CRITICAL</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {breach.dataClasses.map((dc, j) => (
                        <span key={j} className="text-xs px-2 py-1 rounded" style={{ background: '#141d30', color: '#c8d0dd' }}>{dc}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
