# /project:add-scanner

Add a new scanner check module to the CyberPulse scanner engine.

When the user provides a scanner name and description:
1. Create `/lib/scanner/{name}.ts` following the existing pattern:
   - Export an async function `check{Name}(domain: string)`
   - Return `{ score: number, findings: FindingResult[] }`
   - Score starts at 100 and deductions are made per finding
   - Use severity: CRITICAL (-25), HIGH (-15), MEDIUM (-10), LOW (-5)
2. Import and add the new check to `/lib/scanner/index.ts`
3. Add the category to the `WEIGHTS` object (adjust other weights to sum to 1.0)
4. Add the category enum value to `/prisma/schema.prisma` `FindingCategory`
5. Run `npx prisma generate` after schema changes
6. Update the README scanner checks table
