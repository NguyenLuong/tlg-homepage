import { type NextRequest } from "next/server";

import { AuditAction, EntityType, Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/audit/log";
import { requireEditor } from "@/lib/auth/request";
import prisma from "@/lib/db/prisma";
import {
  deleteMediaAsset,
  findMediaAssetById,
} from "@/lib/db/repositories/media";
import {
  apiError,
  apiNoContent,
  apiErrorFromUnknown,
} from "@/lib/http/api-response";
import { deleteImage } from "@/lib/media/image-service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireEditor(request);
    const { id } = await params;

    const asset = await findMediaAssetById(id);

    if (!asset) {
      return apiError(404, "NOT_FOUND", "Media asset not found");
    }

    // Delete from Cloudinary (idempotent — ignores already-deleted assets)
    await deleteImage((asset as { publicId: string }).publicId);

    // Delete from database (FKs with onDelete:SetNull will clear references)
    await prisma.$transaction(async (tx) => {
      await deleteMediaAsset(id, tx);

      await writeAuditLog(
        {
          action: AuditAction.DELETE,
          entityType: EntityType.MEDIA,
          entityId: id,
          createdById: user.id,
          metaJson: {
            publicId: (asset as { publicId: string }).publicId,
            url: (asset as { url: string }).url,
          } as Prisma.InputJsonValue,
        },
        tx,
      );
    });

    return apiNoContent();
  } catch (error) {
    return apiErrorFromUnknown(error);
  }
}
