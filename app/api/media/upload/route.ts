import { type NextRequest } from "next/server";

import { AuditAction, EntityType, Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import { createMediaAsset } from "@/lib/db/repositories/media";
import { apiCreated, apiErrorFromUnknown } from "@/lib/http/api-response";
import { getImageProvider, uploadImage } from "@/lib/media/image-service";
import { ValidationError } from "@/lib/validation/schemas";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ALT_TEXT_LENGTH = 300;
const MAX_FOLDER_LENGTH = 120;
const MAX_PUBLIC_ID_LENGTH = 120;

function parseOptionalText(
  value: FormDataEntryValue | null,
  field: string,
): string | undefined {
  if (value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ValidationError(field, "must be a string");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseUploadFile(value: FormDataEntryValue | null): File {
  if (!(value instanceof File)) {
    throw new ValidationError("file", "is required");
  }

  if (value.size === 0) {
    throw new ValidationError("file", "must not be empty");
  }

  if (value.size > MAX_FILE_BYTES) {
    throw new ValidationError(
      "file",
      `must be at most ${MAX_FILE_BYTES} bytes`,
    );
  }

  if (!value.type || !value.type.startsWith("image/")) {
    throw new ValidationError("file", "must be an image file");
  }

  return value;
}

function parseResourceType(
  value: FormDataEntryValue | null,
): "image" | "video" | "raw" | "auto" {
  if (value === null) {
    return "image";
  }

  if (typeof value !== "string") {
    throw new ValidationError("resourceType", "must be a string");
  }

  const normalized = value.trim();
  if (!normalized) {
    return "image";
  }

  if (normalized !== "image") {
    throw new ValidationError(
      "resourceType",
      "only image uploads are supported",
    );
  }

  return "image";
}

function parseTags(formData: FormData): string[] {
  const rawValues = formData.getAll("tags");
  const values: string[] = [];

  for (const rawValue of rawValues) {
    if (typeof rawValue !== "string") {
      throw new ValidationError("tags", "must be text");
    }

    for (const part of rawValue.split(",")) {
      const trimmed = part.trim();
      if (trimmed) {
        values.push(trimmed);
      }
    }
  }

  return Array.from(new Set(values));
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireEditor(request);
    const formData = await request.formData();

    const file = parseUploadFile(formData.get("file"));
    const altText = parseOptionalText(formData.get("altText"), "altText");
    if (altText && altText.length > MAX_ALT_TEXT_LENGTH) {
      throw new ValidationError(
        "altText",
        `must be at most ${MAX_ALT_TEXT_LENGTH} characters`,
      );
    }

    const folder = parseOptionalText(formData.get("folder"), "folder");
    if (folder && folder.length > MAX_FOLDER_LENGTH) {
      throw new ValidationError(
        "folder",
        `must be at most ${MAX_FOLDER_LENGTH} characters`,
      );
    }

    const publicId = parseOptionalText(formData.get("publicId"), "publicId");
    if (publicId && publicId.length > MAX_PUBLIC_ID_LENGTH) {
      throw new ValidationError(
        "publicId",
        `must be at most ${MAX_PUBLIC_ID_LENGTH} characters`,
      );
    }

    const resourceType = parseResourceType(formData.get("resourceType"));
    const tags = parseTags(formData);

    const provider = getImageProvider();
    const uploaded = await uploadImage(file, {
      folder,
      publicId,
      resourceType,
      tags,
    });

    const width = uploaded.width;
    const height = uploaded.height;

    if (width === undefined || height === undefined) {
      throw new ValidationError(
        "file",
        "uploaded image metadata is incomplete",
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const media = await createMediaAsset(
        {
          provider: provider.providerId as "CLOUDINARY",
          publicId: uploaded.publicId,
          url: uploaded.secureUrl,
          width,
          height,
          bytes: uploaded.bytes ?? file.size,
          mime: file.type || "application/octet-stream",
          altText: altText ?? null,
        },
        tx,
      );

      await writeAuditLog(
        {
          action: AuditAction.CREATE,
          entityType: EntityType.MEDIA,
          entityId: media.id,
          createdById: user.id,
          metaJson: {
            provider: media.provider,
            publicId: media.publicId,
            url: media.url,
            bytes: media.bytes,
            mime: media.mime,
            altText: media.altText,
            originalFilename: file.name,
            cloudinaryAssetId: uploaded.assetId,
            resourceType: uploaded.resourceType,
            tags,
          } as Prisma.InputJsonValue,
        },
        tx,
      );

      return media;
    });

    return apiCreated(created);
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
