/**
 * Endpoint & page discovery scanner.
 * Probes a domain for pages, API routes, admin surfaces, and misconfigured paths.
 * Uses only HTTP(S) requests — no credentials, no aggressive scanning.
 */

export type EndpointType =
  | 'page'
  | 'api'
  | 'auth'
  | 'admin'
  | 'sitemap'
  | 'wellknown'
  | 'sensitive'
  | 'asset';

export type EndpointStatus = 'public' | 'protected' | 'not-found' | 'error' | 'exposed';

export interface DiscoveredEndpoint {
  path: string;
  label: string;
  type: EndpointType;
  statusCode: number | null;
  status: EndpointStatus;
  /** True if the path returned 200 but should require authentication */
  isExposed: boolean;
  note?: string;
}

export interface EndpointDiscoveryResult {
  baseUrl: string;
  sitemapPages: string[];       // URLs found in sitemap.xml
  robotsDisallowed: string[];   // Paths from robots.txt Disallow
  probed: DiscoveredEndpoint[];
  summary: {
    total: number;
    public: number;
    protected: number;
    exposed: number;
    notFound: number;
  };
}

// ─── Probe list ───────────────────────────────────────────────────────────────
// Each entry: [path, label, type, shouldBePrivate]
const PROBE_PATHS: [string, string, EndpointType, boolean][] = [
  // Standard pages
  ['/',              'Home',              'page',      false],
  ['/about',         'About',             'page',      false],
  ['/contact',       'Contact',           'page',      false],
  ['/pricing',       'Pricing',           'page',      false],
  ['/blog',          'Blog',              'page',      false],
  ['/login',         'Login',             'auth',      false],
  ['/signin',        'Sign In',           'auth',      false],
  ['/register',      'Register',          'auth',      false],
  ['/signup',        'Sign Up',           'auth',      false],
  ['/logout',        'Logout',            'auth',      false],
  ['/forgot-password','Forgot Password',  'auth',      false],
  // Dashboard / app
  ['/dashboard',     'Dashboard',         'page',      true],
  ['/account',       'Account',           'page',      true],
  ['/profile',       'Profile',           'page',      true],
  ['/settings',      'Settings',          'page',      true],
  // Admin surfaces
  ['/admin',         'Admin Panel',       'admin',     true],
  ['/admin/users',   'Admin: Users',      'admin',     true],
  ['/wp-admin',      'WordPress Admin',   'admin',     true],
  ['/phpmyadmin',    'phpMyAdmin',        'admin',     true],
  ['/cpanel',        'cPanel',            'admin',     true],
  // API endpoints
  ['/api',           'API Root',          'api',       false],
  ['/api/v1',        'API v1',            'api',       false],
  ['/api/v2',        'API v2',            'api',       false],
  ['/api/health',    'API Health',        'api',       false],
  ['/api/status',    'API Status',        'api',       false],
  ['/api/auth',      'API Auth',          'api',       false],
  ['/api/users',     'API Users',         'api',       true],
  ['/api/admin',     'API Admin',         'api',       true],
  ['/graphql',       'GraphQL',           'api',       false],
  ['/api-docs',      'API Docs',          'api',       false],
  ['/swagger',       'Swagger UI',        'api',       false],
  ['/swagger.json',  'Swagger JSON',      'api',       false],
  ['/openapi.json',  'OpenAPI JSON',      'api',       false],
  // Well-known & meta
  ['/sitemap.xml',   'Sitemap',           'sitemap',   false],
  ['/robots.txt',    'Robots.txt',        'wellknown', false],
  ['/.well-known/security.txt', 'Security.txt', 'wellknown', false],
  ['/.well-known/assetlinks.json', 'Asset Links', 'wellknown', false],
  // Sensitive / misconfigured paths
  ['/.env',          '.env File',         'sensitive', true],
  ['/.env.local',    '.env.local',        'sensitive', true],
  ['/.git',          '.git Directory',    'sensitive', true],
  ['/.git/config',   '.git Config',       'sensitive', true],
  ['/config.json',   'Config JSON',       'sensitive', true],
  ['/package.json',  'package.json',      'sensitive', true],
  ['/.htaccess',     '.htaccess',         'sensitive', true],
  ['/web.config',    'web.config',        'sensitive', true],
  ['/backup.sql',    'SQL Backup',        'sensitive', true],
  ['/dump.sql',      'SQL Dump',          'sensitive', true],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function probeUrl(url: string, timeoutMs = 6000): Promise<number | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'CyberPulse-Security-Scanner/1.0 (+https://cyberpulse.co.za)' },
    });
    clearTimeout(id);
    return res.status;
  } catch {
    return null;
  }
}

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CyberPulse-Security-Scanner/1.0 (+https://cyberpulse.co.za)' },
    });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseSitemapUrls(xml: string, domain: string): string[] {
  const matches = xml.match(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi) ?? [];
  return matches
    .map((m) => m.replace(/<\/?loc>/gi, '').trim())
    .filter((u) => u.includes(domain))
    .slice(0, 30); // cap at 30
}

function parseRobotsDisallowed(txt: string): string[] {
  return txt
    .split('\n')
    .filter((l) => /^Disallow:/i.test(l.trim()))
    .map((l) => l.replace(/^Disallow:\s*/i, '').trim())
    .filter(Boolean)
    .slice(0, 20);
}

function classifyStatus(code: number | null, shouldBePrivate: boolean): EndpointStatus {
  if (code === null) return 'error';
  if (code === 200 || code === 304) {
    return shouldBePrivate ? 'exposed' : 'public';
  }
  if (code === 401 || code === 403) return 'protected';
  if (code === 404 || code === 410) return 'not-found';
  if (code >= 500) return 'error';
  return 'public'; // 301/302 etc.
}

// ─── Main entry ───────────────────────────────────────────────────────────────
export async function discoverEndpoints(domain: string): Promise<EndpointDiscoveryResult> {
  const base = `https://${domain}`;

  // 1. Fetch sitemap + robots in parallel
  const [sitemapText, robotsText] = await Promise.all([
    fetchText(`${base}/sitemap.xml`),
    fetchText(`${base}/robots.txt`),
  ]);

  const sitemapPages = sitemapText ? parseSitemapUrls(sitemapText, domain) : [];
  const robotsDisallowed = robotsText ? parseRobotsDisallowed(robotsText) : [];

  // 2. Probe all paths in parallel (batched to avoid hammering)
  const BATCH = 10;
  const probed: DiscoveredEndpoint[] = [];

  for (let i = 0; i < PROBE_PATHS.length; i += BATCH) {
    const batch = PROBE_PATHS.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async ([path, label, type, shouldBePrivate]) => {
        const code = await probeUrl(`${base}${path}`);
        const epStatus = classifyStatus(code, shouldBePrivate);
        return {
          path,
          label,
          type,
          statusCode: code,
          status: epStatus,
          isExposed: epStatus === 'exposed',
          note: epStatus === 'exposed'
            ? `Sensitive path returned ${code} — should require authentication`
            : epStatus === 'error'
            ? 'Unreachable or timed out'
            : undefined,
        } satisfies DiscoveredEndpoint;
      })
    );
    probed.push(...results);
  }

  // 3. Add notable sitemap pages as page entries (deduplicate)
  const probedPaths = new Set(probed.map((p) => p.path));
  for (const url of sitemapPages.slice(0, 10)) {
    try {
      const u = new URL(url);
      if (!probedPaths.has(u.pathname)) {
        const code = await probeUrl(url);
        probed.push({
          path: u.pathname,
          label: u.pathname,
          type: 'page',
          statusCode: code,
          status: classifyStatus(code, false),
          isExposed: false,
        });
        probedPaths.add(u.pathname);
      }
    } catch { /* skip malformed URLs */ }
  }

  const summary = {
    total:     probed.length,
    public:    probed.filter((e) => e.status === 'public').length,
    protected: probed.filter((e) => e.status === 'protected').length,
    exposed:   probed.filter((e) => e.isExposed).length,
    notFound:  probed.filter((e) => e.status === 'not-found').length,
  };

  return { baseUrl: base, sitemapPages, robotsDisallowed, probed, summary };
}
