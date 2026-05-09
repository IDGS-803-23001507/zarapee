import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  BASE_SELECT_BEBIDAS,
  mapBebida,
  normalizeBebidaPayload,
  getBebidaById,
} from "./helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
function getDatabaseErrorMessage(error, fallback) {
  const errorCode = error?.code;

  if (errorCode === "ER_ACCESS_DENIED_ERROR") {
    return "No se pudo conectar a la base de datos. Revisa DB_USER y DB_PASSWORD.";
  }
  if (errorCode === "ER_BAD_DB_ERROR") {
    return "No se encontró la base de datos configurada. Revisa DB_NAME.";
  }

  return fallback;
}

export async function GET() {
  try {
    const [rows] = await pool.query(`${BASE_SELECT_BEBIDAS} ORDER BY b.idBebida DESC`);
    return NextResponse.json(rows.map(mapBebida), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error al consultar bebidas:", error);
    return NextResponse.json(
      {
        error: getDatabaseErrorMessage(
          error,
          "No se pudo cargar el módulo de bebidas."
        ),
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [productoResult] = await connection.query(
      `
        INSERT INTO Producto (nombre, descripcion, foto, precio, tipo, estatus)
        VALUES (?, ?, ?, ?, 'BEBIDA', ?)
      `,
      [data.nombre, data.descripcion, data.foto, data.precio, data.estatus]
    );

    const [bebidaResult] = await connection.query(
      `INSERT INTO Bebida (idProducto) VALUES (?)`,
      [productoResult.insertId]
    );

    const bebidaCreada = await getBebidaById(connection, bebidaResult.insertId);

    await connection.commit();
    return NextResponse.json(bebidaCreada, { status: 201 });
  } catch (transactionError) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error al crear bebida:", transactionError);
    return NextResponse.json(
      {
        error: getDatabaseErrorMessage(
          transactionError,
          "No se pudo crear la bebida en base de datos."
        ),
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
