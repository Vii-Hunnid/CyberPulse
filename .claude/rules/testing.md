# Testing Guidelines

## Before Committing
Run these checks:
```bash
npx tsc --noEmit        # TypeScript — must have 0 errors
npm run lint            # ESLint — fix all warnings
```

## Manual Testing Checklist
- [ ] Homepage renders with dark navy background and cyan hero CTA
- [ ] `/scan?domain=example.com` loads and starts free scan flow
- [ ] Rate limiting returns 429 after 3 free scans from same IP
- [ ] `/login` accepts credentials and redirects to `/dashboard`
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] `/api/scan/[id]/report` returns 409 if integrity root is tampered

## Environment Requirements
- PostgreSQL running locally on port 5432
- All `.env.local` values must be real (not placeholder) for full flow
- HIBP API key needed for dark web checks to return real data
- ANTHROPIC_API_KEY needed for AI narrative generation
