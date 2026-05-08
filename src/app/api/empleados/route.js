import { NextResponse } from "next/server";
import pool from "@/lib/db";

const requiredFields = [
  "idUsuario",
  "idSucursal",
  "nombre",
  "apellidoPa",
  "telefono",
  "fechaNac",
];

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
  const missing = requiredFields.filter((field) => {
    if (field === "fechaNac") return !payload.fechaNac;
    if (field === "nombre" || field === "apellidoPa" || field === "telefono") {
      return !payload[field];
    }
    return Number.isNaN(payload[field]) || payload[field] <= 0;
  });

  if (missing.length > 0) {
    return `Faltan datos requeridos: ${missing.join(", ")}`;
  }

  return "";
};

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT e.idEmpleado, e.idUsuario, e.idSucursal, e.nombre, e.apellidoPa, e.apellidoMa,
              e.telefono, DATE_FORMAT(e.fechaNac, '%Y-%m-%d') AS fechaNac,
              u.Email AS email, s.nombre AS sucursalNombre
       FROM Empleado e
       JOIN Usuario u ON e.idUsuario = u.idUsuario
       JOIN Sucursal s ON e.idSucursal = s.idSucursal
       ORDER BY e.idEmpleado DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al consultar empleados", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = normalizeBody(body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO Empleado
        (idUsuario, idSucursal, nombre, apellidoPa, apellidoMa, telefono, fechaNac)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    , [
      payload.idUsuario,
      payload.idSucursal,
      payload.nombre,
      payload.apellidoPa,
      payload.apellidoMa || null,
      payload.telefono,
      payload.fechaNac,
    ]);

    return NextResponse.json({ idEmpleado: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error al crear empleado", error: String(error) },
      { status: 500 }
    );
  }
}
