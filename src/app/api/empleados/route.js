import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  BASE_SELECT_EMPLEADOS,
  getEmpleadoById,
  mapEmpleado,
  normalizeEmpleadoPayload,
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
    const [rows] = await pool.query(`${BASE_SELECT_EMPLEADOS} ORDER BY e.idEmpleado DESC`);
    return NextResponse.json(rows.map(mapEmpleado), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error al consultar empleados:", error);
    return NextResponse.json(
      {
        error: getDatabaseErrorMessage(
          error,
          "No se pudo cargar el módulo de empleados."
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

  const { data, error } = normalizeEmpleadoPayload(payload);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO Empleado
          (idUsuario, idSucursal, nombre, apellidoPa, apellidoMa, telefono, fechaNac)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.idUsuario,
        data.idSucursal,
        data.nombre,
        data.apellidoPa,
        data.apellidoMa,
        data.telefono,
        data.fechaNac,
      ]
    );

    const empleadoCreado = await getEmpleadoById(pool, result.insertId);
    return NextResponse.json(empleadoCreado, { status: 201 });
  } catch (dbError) {
    console.error("Error al crear empleado:", dbError);
    return NextResponse.json(
      {
        error: getDatabaseErrorMessage(
          dbError,
          "No se pudo crear el empleado en base de datos."
        ),
      },
      { status: 500 }
    );
  }
}
