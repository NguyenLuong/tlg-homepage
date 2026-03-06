# jp-recruiter Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-07

## Active Technologies

- TypeScript 5.x, Node.js 20+ + Next.js App Router, React, Prisma ORM, Zod validation, Tailwind CSS (001-add-user-pages)
- PostgreSQL qua Prisma schema/migrations (001-add-user-pages)
- TypeScript 5.x on Node.js 20+ (repo currently uses Next.js 16.1.6, React 19.2.3) + Next.js App Router, React, Prisma ORM, Tailwind CSS, shadcn/ui, Zod-style validation patterns via `lib/validation/schemas.ts` (001-detail-page-refresh)
- PostgreSQL via Prisma schema (`prisma/schema.prisma`) (001-detail-page-refresh)
- TypeScript 5.x on Node.js 20+ (repo currently uses Next.js 16.1.6, React 19.2.3) + Next.js App Router, React, Prisma ORM, Tailwind CSS, shadcn/ui, Auth.js-style session token flow (`lib/auth/session-token.ts`), validation helpers in `lib/validation/schemas.ts` (001-admin-cms)

- TypeScript 5.x, Node.js 20+, Next.js 15 (App Router) + Next.js, React, Tailwind CSS, shadcn/ui, Prisma, Auth.js (Credentials), Zod, Cloudinary SDK (master)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x, Node.js 20+, Next.js 15 (App Router): Follow standard conventions

## Recent Changes

- 001-admin-cms: Added TypeScript 5.x on Node.js 20+ (repo currently uses Next.js 16.1.6, React 19.2.3) + Next.js App Router, React, Prisma ORM, Tailwind CSS, shadcn/ui, Auth.js-style session token flow (`lib/auth/session-token.ts`), validation helpers in `lib/validation/schemas.ts`
- 001-detail-page-refresh: Added TypeScript 5.x on Node.js 20+ (repo currently uses Next.js 16.1.6, React 19.2.3) + Next.js App Router, React, Prisma ORM, Tailwind CSS, shadcn/ui, Zod-style validation patterns via `lib/validation/schemas.ts`
- 001-add-user-pages: Added TypeScript 5.x, Node.js 20+ + Next.js App Router, React, Prisma ORM, Zod validation, Tailwind CSS

<!-- MANUAL ADDITIONS START -->

## Agent Execution Rules

- Always run lint using this exact command format:
  - `npm.cmd run lint -- lib/validation/schemas.ts tests/unit/validation-query-params.test.ts`
- Always run test using this exact command format:
  - `npm.cmd run test -- tests/unit/validation-query-params.test.ts`
- Tests must run in self-termination mode only (non-watch). Do not use watch mode.
- Remember to use powershell terminal instead of bash
- Use `<div>` instead of `<span>` for wrapper/label text elements in JSX
<!-- MANUAL ADDITIONS END -->
