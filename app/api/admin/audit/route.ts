import { type NextRequest } from "next/server";

import { AuditAction, EntityType } from "@prisma/client";

import { requireEditor } from "@/lib/auth/request";
import { findAuditLogsAndRevisions } from "@/lib/db/repositories/audit";
import { apiAdminErrorFromUnknown, apiAdminOk } from "@/lib/http/api-response";
import { ValidationError, parseUuidValue } from "@/lib/validation/schemas";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function parseLimit(value: string | null): number {
  if (value === null) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw new ValidationError("limit", "must be an integer");
  }

  if (parsed < 1 || parsed > MAX_LIMIT) {
    throw new ValidationError("limit", `must be between 1 and ${MAX_LIMIT}`);
  }

  return parsed;
}

function parseEntityType(value: string | null): EntityType | undefined {
  if (!value) {
    return undefined;
  }

  if (!(Object.values(EntityType) as string[]).includes(value)) {
    throw new ValidationError(
      "entityType",
      `must be one of: ${(Object.values(EntityType) as string[]).join(", ")}`,
    );
  }

  return value as EntityType;
}

function parseAction(value: string | null): AuditAction | undefined {
  if (!value) {
    return undefined;
  }

  if (!(Object.values(AuditAction) as string[]).includes(value)) {
    throw new ValidationError(
      "action",
      `must be one of: ${(Object.values(AuditAction) as string[]).join(", ")}`,
    );
  }

  return value as AuditAction;
}

export async function GET(request: NextRequest) {
  try {
    await requireEditor(request);

    const searchParams = request.nextUrl.searchParams;

    const limit = parseLimit(searchParams.get("limit"));
    const entityType = parseEntityType(searchParams.get("entityType"));
    const action = parseAction(searchParams.get("action"));
    const rawEntityId = searchParams.get("entityId");
    const entityId = rawEntityId
      ? parseUuidValue(rawEntityId, "entityId")
      : undefined;

    const { auditLogs, revisions } = await findAuditLogsAndRevisions({
      entityType,
      action,
      entityId,
      limit,
    });

    return apiAdminOk({
      filters: {
        limit,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        action: action ?? null,
      },
      auditLogs,
      revisions,
    });
  } catch (error) {
    return apiAdminErrorFromUnknown(error);
  }
}
