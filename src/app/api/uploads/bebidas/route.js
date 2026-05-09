import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/pjpeg",
  "image/jfif",
]);

const MIME_EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/jfif": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "image/x-ms-bmp": ".bmp",
};

const ALLOWED_FILE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".jfif",
]);

function getFileExtension(fileName) {
  return path.extname(String(fileName || "")).toLowerCase();
}

function hasAllowedFileType(file) {
  const mimeType = String(file?.type || "").toLowerCase();
  const extension = getFileExtension(file?.name);

  if (mimeType && ALLOWED_MIME_TYPES.has(mimeType)) return true;
  if (extension && ALLOWED_FILE_EXTENSIONS.has(extension)) return true;

  return false;
}

function createUniqueFileName(originalName, mimeType) {
  const extensionFromName = path.extname(originalName || "").toLowerCase();
  const extension =
    (ALLOWED_FILE_EXTENSIONS.has(extensionFromName) && extensionFromName) ||
    MIME_EXTENSION_MAP[mimeType] ||
    ".jpg";
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `bebida-${Date.now()}-${randomPart}${extension}`;
}

export async function POST(request) {
  let formData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar el archivo enviado." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json(
      { error: "Debes seleccionar un archivo de imagen válido." },
      { status: 400 }
    );
  }

  if (!hasAllowedFileType(file)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG, WEBP, GIF o BMP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "La imagen es demasiado grande. Máximo 5 MB." },
      { status: 400 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = createUniqueFileName(file.name, file.type);

    const uploadDirectory = path.join(process.cwd(), "public", "uploads", "bebidas");
    await mkdir(uploadDirectory, { recursive: true });

    const filePath = path.join(uploadDirectory, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json(
      { fileUrl: `/uploads/bebidas/${fileName}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al subir imagen de bebida:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la imagen de la bebida." },
      { status: 500 }
    );
  }
}
