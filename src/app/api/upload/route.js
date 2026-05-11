import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Esta configuración es necesaria para App Router para manejar FormData
export const runtime = 'nodejs'; 

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se subió ningún archivo." }, { status: 400 });
    }

    // Convertir el archivo a un Buffer para poder guardarlo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Definir la ruta de guardado: public/uploads
    // Asegúrate de crear manualmente la carpeta 'uploads' dentro de 'public'
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Crear el nombre del archivo único para evitar sobrescrituras
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.name);
    const finalPath = path.join(uploadDir, filename);

    // Guardar el archivo en el disco
    await fs.writeFile(finalPath, buffer);

    // Devolver la URL pública que usará el frontend
    const publicUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: publicUrl }, { status: 201 });

  } catch (error) {
    console.error("Error en la subida de archivo API:", error);
    return NextResponse.json({ error: "Error interno al subir archivo." }, { status: 500 });
  }
}