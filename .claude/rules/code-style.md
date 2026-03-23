# Code Style Rules

## TypeScript
- Strict mode is enabled — no implicit `any`
- Use `type` for object shapes, `interface` for extendable contracts
- Prefer `async/await` over `.then()` chains
- Always handle errors with try/catch in API routes

## React / Next.js
- Server Components by default — only add `'use client'` when using hooks or browser APIs
- Use Next.js App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`)
- API routes use the `NextRequest` / `NextResponse` pattern

## Styling
- Design language: dark navy (#0a0f1e bg), cyan (#00d4ff) primary accent, green (#00ff88) success, red (#ff3366) critical
- Use inline styles for dynamic/brand colours, Tailwind for layout utilities
- No heavy CSS frameworks beyond Tailwind

## Database
- All DB access goes through `@/lib/db` (Prisma singleton)
- Never instantiate `PrismaClient` directly in route handlers
- Use `prisma.model.findUnique` / `findFirst` with explicit `where` clauses

## Security
- All scan results stored encrypted via `@/lib/scca`
- Verify `integrityRoot` before serving any scan report
- Rate limit all public endpoints (3 requests / 24h for free scan)
- Never log raw passwords, API keys, or SCCA master key
