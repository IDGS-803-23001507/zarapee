import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  getEmpleadoById,
  normalizeEmpleadoPayload,
  parseNumericId,
} from "../helpers";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const idEmpleado = parseNumericId(id);

  if (!idEmpleado) {
    return NextResponse.json({ error: "ID de empleado inválido." }, { status: 400 });
  }

  try {
    const empleado = await getEmpleadoById(pool, idEmpleado);

    if (!empleado) {
      return NextResponse.json({ error: "Empleado no encontrado." }, { status: 404 });
    }

    return NextResponse.json(empleado);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el empleado." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const idEmpleado = parseNumericId(id);

  if (!idEmpleado) {
    return NextResponse.json({ error: "ID de empleado inválido." }, { status: 400 });
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

  const { data, error } = normalizeEmpleadoPayload(payload);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      `
        UPDATE Empleado
        SET idUsuario = ?, idSucursal = ?, nombre = ?, apellidoPa = ?, apellidoMa = ?, telefono = ?, fechaNac = ?
        WHERE idEmpleado = ?
      `,
      [
        data.idUsuario,
        data.idSucursal,
        data.nombre,
        data.apellidoPa,
        data.apellidoMa,
        data.telefono,
        data.fechaNac,
        idEmpleado,
      ]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ error: "Empleado no encontrado." }, { status: 404 });
    }

    const empleadoActualizado = await getEmpleadoById(pool, idEmpleado);
    return NextResponse.json(empleadoActualizado);
  } catch (dbError) {
    console.error("Error al actualizar empleado:", dbError);
    return NextResponse.json(
      { error: "No se pudo actualizar el empleado." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const idEmpleado = parseNumericId(id);

  if (!idEmpleado) {
    return NextResponse.json({ error: "ID de empleado inválido." }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM Empleado WHERE idEmpleado = ?",
      [idEmpleado]
    );

    if (!result.affectedRows) {
      return NextResponse.json({ error: "Empleado no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Empleado eliminado correctamente." });
  } catch (dbError) {
    console.error("Error al eliminar empleado:", dbError);
    return NextResponse.json(
      { error: "No se pudo eliminar el empleado." },
      { status: 500 }
    );
  }
}
