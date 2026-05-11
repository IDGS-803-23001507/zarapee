import { NextResponse } from "next/server";
import pool from "@/lib/db";

const requiredFields = [
  "nombre",
  "descripcion",
  "precio",
];

const normalizeBody = (body) => ({
  nombre: (body.nombre || "").trim(),
  descripcion: (body.descripcion || "").trim(),
  foto: body.foto || null,
  precio: Number(body.precio),
  productos: Array.isArray(body.productos) ? body.productos : [],
});

const validatePayload = (payload) => {
  const missing = requiredFields.filter((field) => {
    if (field === "precio") {
      return Number.isNaN(payload.precio) || payload.precio <= 0;
    }

    return !payload[field];
  });

  if (missing.length > 0) {
    return `Faltan datos requeridos: ${missing.join(", ")}`;
  }

  return "";
};

export async function GET() {
  try {

    const [rows] = await pool.query(`
      SELECT 
        c.idCombo,
        p.idProducto,
        p.nombre,
        p.descripcion,
        p.foto,
        p.precio,
        p.estatus
      FROM Combo c
      INNER JOIN Producto p
        ON c.idProducto = p.idProducto
      WHERE p.tipo = 'COMBO'
      ORDER BY c.idCombo DESC
    `);

    return NextResponse.json(rows);

  } catch (error) {

    return NextResponse.json(
      {
        message: "Error al consultar combos",
        error: String(error),
      },
      { status: 500 }
    );

  }
}

export async function POST(request) {

  const connection = await pool.getConnection();

  try {

    const body = await request.json();

    const payload = normalizeBody(body);

    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // 1. Crear producto tipo COMBO
    const [productoResult] = await connection.execute(
      `
      INSERT INTO Producto
      (nombre, descripcion, foto, precio, tipo)
      VALUES (?, ?, ?, ?, 'COMBO')
      `,
      [
        payload.nombre,
        payload.descripcion,
        payload.foto,
        payload.precio,
      ]
    );

    const idProducto = productoResult.insertId;

    // 2. Crear combo
    const [comboResult] = await connection.execute(
      `
      INSERT INTO Combo (idProducto)
      VALUES (?)
      `,
      [idProducto]
    );

    const idCombo = comboResult.insertId;

    // 3. Insertar detalle combo
    for (const item of payload.productos) {

      await connection.execute(
        `
        INSERT INTO DetalleCombo
        (idCombo, idProducto, cantidad)
        VALUES (?, ?, ?)
        `,
        [
          idCombo,
          Number(item.idProducto),
          Number(item.cantidad || 1),
        ]
      );
    }

    await connection.commit();

    return NextResponse.json(
      {
        message: "Combo creado correctamente",
        idCombo,
      },
      { status: 201 }
    );

  } catch (error) {

    await connection.rollback();

    return NextResponse.json(
      {
        message: "Error al crear combo",
        error: String(error),
      },
      { status: 500 }
    );

  } finally {

    connection.release();

  }
}