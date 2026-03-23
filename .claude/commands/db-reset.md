# /project:db-reset

Reset the development database and regenerate the Prisma client.

Steps:
1. Run `npx prisma migrate reset --force`
2. Run `npx prisma generate`
3. Confirm the client was generated successfully
4. Remind the user to restart the dev server

Only run this when the user explicitly requests a database reset.
