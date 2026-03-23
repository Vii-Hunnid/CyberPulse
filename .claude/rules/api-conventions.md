# API Conventions

## Route Structure
```
/api/auth/*         → NextAuth + registration (public)
/api/scan/start     → Trigger authenticated scan (POST, auth required)
/api/scan/free      → Free teaser scan (POST, public, rate-limited)
/api/scan/[id]/*    → Scan operations (auth required)
/api/org/[id]/*     → Organisation operations (auth required)
/api/darkweb/*      → Dark web checks (auth required)
```

## Response Conventions
- Success: `{ data }` with appropriate 2xx status
- Error: `{ error: string }` with appropriate 4xx/5xx status
- Async jobs: Return `{ scanId }` with `202 Accepted` immediately

## Auth Pattern
Every protected route starts with:
```typescript
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
```

## Validation
- Use `zod` for all request body validation
- Return 400 with `error.flatten()` on schema failure

## Prisma Updates
- Use `prisma.model.update` not `upsert` unless intentional
- Background async tasks (scan runs) use IIFE: `(async () => { ... })()`
