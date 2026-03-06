import { AuditAction, EntityType, Prisma } from "@prisma/client";

import { AuditFilterBar } from "@/components/admin/audit-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findAuditLogsAndRevisions } from "@/lib/db/repositories/audit";

type AuditPageSearchParams = Record<string, string | string[] | undefined>;

type AuditPageProps = {
  searchParams: Promise<AuditPageSearchParams>;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const ACTION_BADGE_VARIANT: Record<
  AuditAction,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  PUBLISH: "default",
  SCHEDULE: "outline",
  DELETE: "destructive",
  LOGIN: "secondary",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseLimit(value: string | undefined): number {
  if (!value) {
    return DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.max(1, parsed));
}

function parseEntityType(value: string | undefined): EntityType | undefined {
  if (!value) {
    return undefined;
  }

  if (!(Object.values(EntityType) as string[]).includes(value)) {
    return undefined;
  }

  return value as EntityType;
}

function parseAction(value: string | undefined): AuditAction | undefined {
  if (!value) {
    return undefined;
  }

  if (!(Object.values(AuditAction) as string[]).includes(value)) {
    return undefined;
  }

  return value as AuditAction;
}

function parseEntityId(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

function compactJson(value: Prisma.JsonValue): string {
  return truncate(JSON.stringify(value), 140);
}

export default async function AdminAuditPage({ searchParams }: AuditPageProps) {
  const resolvedSearchParams = await searchParams;

  const limit = parseLimit(firstValue(resolvedSearchParams.limit));
  const entityType = parseEntityType(
    firstValue(resolvedSearchParams.entityType),
  );
  const action = parseAction(firstValue(resolvedSearchParams.action));
  const entityId = parseEntityId(firstValue(resolvedSearchParams.entityId));

  const { auditLogs, revisions } = await findAuditLogsAndRevisions({
    entityType,
    action,
    entityId,
    limit,
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Audit & revisions
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review system activity and immutable content snapshots.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditFilterBar
            entityTypes={Object.values(EntityType) as string[]}
            actions={Object.values(AuditAction) as string[]}
            defaults={{
              entityType: entityType ?? "",
              action: action ?? "",
              entityId: entityId ?? "",
              limit: String(limit),
            }}
            maxLimit={MAX_LIMIT}
          />
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Audit entries
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold text-slate-900">
            {auditLogs.length}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">
              Revisions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold text-slate-900">
            {revisions.length}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit log</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No audit entries matched the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Entity</th>
                    <th className="px-3 py-2">Meta</th>
                    <th className="px-3 py-2">Actor</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="align-top text-slate-700">
                      <td className="px-3 py-3">
                        <Badge variant={ACTION_BADGE_VARIANT[log.action]}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">
                          {log.entityType}
                        </div>
                        <div className="max-w-xs break-all text-xs text-slate-500">
                          {log.entityId ?? "-"}
                        </div>
                      </td>
                      <td className="max-w-md px-3 py-3 text-xs text-slate-600">
                        <code className="break-all">
                          {compactJson(log.metaJson)}
                        </code>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {log.createdBy.name}
                        <div className="text-xs text-slate-500">
                          {log.createdBy.email}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revisions</CardTitle>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              No revisions matched the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Entity</th>
                    <th className="px-3 py-2">Snapshot</th>
                    <th className="px-3 py-2">Actor</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revisions.map((revision) => (
                    <tr key={revision.id} className="align-top text-slate-700">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">
                          {revision.entityType}
                        </div>
                        <div className="max-w-xs break-all text-xs text-slate-500">
                          {revision.entityId}
                        </div>
                      </td>
                      <td className="max-w-md px-3 py-3 text-xs text-slate-600">
                        <code className="break-all">
                          {compactJson(revision.snapshotJson)}
                        </code>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {revision.createdBy.name}
                        <div className="text-xs text-slate-500">
                          {revision.createdBy.email}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {formatDate(revision.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
