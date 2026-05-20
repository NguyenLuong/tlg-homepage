# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3456
npm run build      # Production build
npm run lint       # ESLint (Next.js config)
npm run tsc        # TypeScript type checking
npm test           # Vitest (jsdom environment)
npm test -- path/to/file  # Run a single test file
```

## Architecture

**Framework:** Next.js App Router (React 19, TypeScript 5, Tailwind CSS 4)

**Routing layout:**
- `app/(public)/` — public-facing pages
- `app/admin/` — admin dashboard (protected, requires `requireEditor()`)
- `app/api/` — API routes, primarily admin news management endpoints

**Data layer:**
- Prisma ORM with PostgreSQL — schema in `prisma/schema.prisma`, migrations in `prisma/migrations/`
- Repository pattern: data access logic lives in `lib/db/` (not in route handlers directly)
- TanStack React Query for client-side data fetching in admin views (provider in admin layout)

**`lib/` structure — key subdirectories:**
- `lib/auth/` — authentication helpers, `requireEditor()` middleware for admin protection
- `lib/db/` — Prisma repositories for each entity
- `lib/audit/` — audit logging on entity changes
- `lib/revision/` — revision snapshots for tracking edits over time
- `lib/media/` — media upload handling (Cloudinary, Buttercms CDN)
- `lib/i18n/` — internationalization
- `lib/seo/` — metadata and Open Graph helpers
- `lib/validation/` — Zod schemas shared across API and forms

**Components:**
- `components/ui/` — shadcn/ui primitives (Radix-based)
- `components/admin/` — admin-specific components
- Rich text editing via Tiptap (extensions for images, links, underline)
- Forms use Zod validation, toasts via Sonner

**Patterns to follow:**
- Admin routes must call `requireEditor()` to enforce authentication
- Entity mutations should write to the audit log and save a revision snapshot
- Slugs are generated uniquely — use the existing slug utility in `lib/utils/`
- HTML from the rich text editor must be sanitized via `sanitize-html` before persisting
