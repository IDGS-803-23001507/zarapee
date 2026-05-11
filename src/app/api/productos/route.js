import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {

  try {

    const [rows] = await pool.query(`
      SELECT
        idProducto,
        nombre,
        descripcion,
        precio,
        tipo
      FROM Producto
      WHERE tipo IN ('ALIMENTO', 'BEBIDA')
      AND estatus = 1
      ORDER BY nombre
    `);

    return NextResponse.json(rows);

  } catch (error) {

    return NextResponse.json(
      {
        message: "Error al consultar productos",
        error: String(error),
      },
      { status: 500 }
    );
  }
}