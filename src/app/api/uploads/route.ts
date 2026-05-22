import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { requireCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

type UploadedImage = {
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function isUploadedImage(value: unknown): value is UploadedImage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    type?: unknown;
    size?: unknown;
    arrayBuffer?: unknown;
  };

  return (
    typeof candidate.type === "string" &&
    typeof candidate.size === "number" &&
    typeof candidate.arrayBuffer === "function"
  );
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!user) {
    return jsonError("You must be logged in", 401);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!isUploadedImage(file) || file.size <= 0) {
    return jsonError("Choose an image from your computer");
  }

  const fileType = file.type.toLowerCase();

  if (!IMAGE_TYPES[fileType]) {
    return jsonError("Upload a JPG, PNG, WEBP, or GIF image");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return jsonError("Image must be 2 MB or smaller");
  }

  const extension = IMAGE_TYPES[fileType];
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const uploadPath = join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(uploadPath, bytes);

  return NextResponse.json({
    imageUrl: `/uploads/${fileName}`
  });
}
