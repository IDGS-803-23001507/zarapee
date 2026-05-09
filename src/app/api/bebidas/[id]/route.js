import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  getBebidaById,
  normalizeBebidaPayload,
  parseNumericId,
} from "../helpers";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const idBebida = parseNumericId(id);

  if (!idBebida) {
    return NextResponse.json({ error: "ID de bebida inválido." }, { status: 400 });
  }

  try {
    const bebida = await getBebidaById(pool, idBebida);

    if (!bebida) {
      return NextResponse.json({ error: "Bebida no encontrada." }, { status: 404 });
    }

    return NextResponse.json(bebida);
  } catch (error) {
    console.error("Error al obtener bebida:", error);
    return NextResponse.json(
      { error: "No se pudo consultar la bebida." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const idBebida = parseNumericId(id);

  if (!idBebida) {
    return NextResponse.json({ error: "ID de bebida inválido." }, { status: 400 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición es inválido." },
      { status: 400 }
    );
  }

  const { data, error } = normalizeBebidaPayload(payload);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      `
        UPDATE Producto p
        INNER JOIN Bebida b ON b.idProducto = p.idProducto
        SET p.nombre = ?, p.descripcion = ?, p.foto = ?, p.precio = ?, p.estatus = ?
        WHERE b.idBebida = ? AND p.tipo = 'BEBIDA'
      `,
      [data.nombre, data.descripcion, data.foto, data.precio, data.estatus, idBebida]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ error: "Bebida no encontrada." }, { status: 404 });
    }

    const bebidaActualizada = await getBebidaById(pool, idBebida);
    return NextResponse.json(bebidaActualizada);
  } catch (dbError) {
    console.error("Error al actualizar bebida:", dbError);
    return NextResponse.json(
      { error: "No se pudo actualizar la bebida." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const idBebida = parseNumericId(id);

  if (!idBebida) {
    return NextResponse.json({ error: "ID de bebida inválido." }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      `
        UPDATE Producto p
        INNER JOIN Bebida b ON b.idProducto = p.idProducto
        SET p.estatus = 0
        WHERE b.idBebida = ? AND p.tipo = 'BEBIDA'
      `,
      [idBebida]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ error: "Bebida no encontrada." }, { status: 404 });
    }

    return NextResponse.json({ message: "Bebida desactivada correctamente." });
  } catch (dbError) {
    console.error("Error al desactivar bebida:", dbError);
    return NextResponse.json(
      { error: "No se pudo desactivar la bebida." },
      { status: 500 }
    );
  }
}
