/**
 * Data Access Layer — Repository Index
 *
 * All database queries and mutations are centralized here.
 * Components and API routes should import from this layer
 * rather than using the Prisma client directly.
 *
 * When switching ORMs in the future, only the files under
 * `lib/db/repositories/` need to change — consumers remain untouched.
 */

export type { DbClient } from "./jobs";

// ── Domain repositories ────────────────────────────────────
export * as jobsRepo from "./jobs";
export * as newsRepo from "./news";
export * as auditRepo from "./audit";
export * as usersRepo from "./users";
export * as mediaRepo from "./media";
export * as lookupsRepo from "./lookups";
export * as contactSubmissionsRepo from "./contact-submissions";
