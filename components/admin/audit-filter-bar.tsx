"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AuditFilterBarProps = {
  entityTypes: string[];
  actions: string[];
  defaults: {
    entityType: string;
    action: string;
    entityId: string;
    limit: string;
  };
  maxLimit: number;
};

const NONE = "__none__";

export function AuditFilterBar({
  entityTypes,
  actions,
  defaults,
  maxLimit,
}: AuditFilterBarProps) {
  const router = useRouter();
  const [entityType, setEntityType] = useState(defaults.entityType || NONE);
  const [action, setAction] = useState(defaults.action || NONE);
  const [entityId, setEntityId] = useState(defaults.entityId);
  const [limit, setLimit] = useState(defaults.limit);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (entityType !== NONE) params.set("entityType", entityType);
    if (action !== NONE) params.set("action", action);
    if (entityId.trim()) params.set("entityId", entityId.trim());
    if (limit) params.set("limit", limit);
    router.push(`/admin/audit?${params.toString()}`);
  };

  return (
    <form
      className="grid gap-3 md:grid-cols-4 lg:grid-cols-5"
      onSubmit={handleSubmit}
    >
      <label className="space-y-1 text-sm text-slate-700">
        <span>Entity type</span>
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-full rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All</SelectItem>
            {entityTypes.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1 text-sm text-slate-700">
        <span>Action</span>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-full rounded-md">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All</SelectItem>
            {actions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1 text-sm text-slate-700">
        <span>Entity ID</span>
        <input
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="UUID"
        />
      </label>

      <label className="space-y-1 text-sm text-slate-700">
        <span>Limit</span>
        <input
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          max={maxLimit}
          min={1}
          type="number"
        />
      </label>

      <div className="flex items-end gap-2">
        <button
          className="h-9 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-700"
          type="submit"
        >
          Apply
        </button>
        <Link
          className="inline-flex h-9 items-center rounded-md border border-slate-200 px-4 text-sm text-slate-700 hover:bg-slate-50"
          href="/admin/audit"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
