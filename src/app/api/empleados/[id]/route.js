import { NextResponse } from "next/server";
import pool from "@/lib/db";

const normalizeBody = (body) => ({
  idUsuario: Number(body.idUsuario),
  idSucursal: Number(body.idSucursal),
  nombre: (body.nombre || "").trim(),
  apellidoPa: (body.apellidoPa || "").trim(),
  apellidoMa: (body.apellidoMa || "").trim(),
  telefono: (body.telefono || "").trim(),
  fechaNac: body.fechaNac,
});

const validatePayload = (payload) => {
  const missing = [];

  if (!payload.idUsuario || Number.isNaN(payload.idUsuario)) missing.push("idUsuario");
  if (!payload.idSucursal || Number.isNaN(payload.idSucursal)) missing.push("idSucursal");
  if (!payload.nombre) missing.push("nombre");
  if (!payload.apellidoPa) missing.push("apellidoPa");
  if (!payload.telefono) missing.push("telefono");
  if (!payload.fechaNac) missing.push("fechaNac");

  if (missing.length > 0) {
    return `Faltan datos requeridos: ${missing.join(", ")}`;
  }

  return "";
};

export async function PUT(request, { params }) {
  const idEmpleado = Number(params.id);
  if (!idEmpleado || Number.isNaN(idEmpleado)) {
    return NextResponse.json({ message: "ID invalido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const payload = normalizeBody(body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const [result] = await pool.execute(
      `UPDATE Empleado
       SET idUsuario = ?, idSucursal = ?, nombre = ?, apellidoPa = ?, apellidoMa = ?, telefono = ?, fechaNac = ?
       WHERE idEmpleado = ?`
    , [
      payload.idUsuario,
      payload.idSucursal,
      payload.nombre,
      payload.apellidoPa,
      payload.apellidoMa || null,
      payload.telefono,
      payload.fechaNac,
      idEmpleado,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al actualizar empleado", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const idEmpleado = Number(params.id);
  if (!idEmpleado || Number.isNaN(idEmpleado)) {
    return NextResponse.json({ message: "ID invalido" }, { status: 400 });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM Empleado WHERE idEmpleado = ?",
      [idEmpleado]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al eliminar empleado", error: String(error) },
      { status: 500 }
    );
  }
}
