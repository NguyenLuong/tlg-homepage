export function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function toDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function parseDescriptionHtml(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;
  if (typeof record.html === "string") {
    return record.html;
  }

  if (record.localized && typeof record.localized === "object") {
    const localized = record.localized as Record<string, unknown>;
    const viBlock = localized.vi;
    const jaBlock = localized.ja;

    if (viBlock && typeof viBlock === "object") {
      const viRecord = viBlock as Record<string, unknown>;
      if (typeof viRecord.html === "string") {
        return viRecord.html;
      }
    }

    if (jaBlock && typeof jaBlock === "object") {
      const jaRecord = jaBlock as Record<string, unknown>;
      if (typeof jaRecord.html === "string") {
        return jaRecord.html;
      }
    }
  }

  return "";
}

export function slugifyFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
