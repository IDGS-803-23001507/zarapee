export const BASE_SELECT_EMPLEADOS = `
  SELECT
    e.idEmpleado,
    e.idUsuario,
    e.idSucursal,
    e.nombre,
    e.apellidoPa,
    e.apellidoMa,
    e.telefono,
    DATE_FORMAT(e.fechaNac, '%Y-%m-%d') AS fechaNac,
    u.Email AS email,
    s.nombre AS sucursalNombre
  FROM Empleado e
  JOIN Usuario u ON e.idUsuario = u.idUsuario
  JOIN Sucursal s ON e.idSucursal = s.idSucursal
`;

function normalizeString(value) {
  return String(value ?? "").trim();
}

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export function mapEmpleado(row) {
  return {
    idEmpleado: row.idEmpleado,
    idUsuario: row.idUsuario,
    idSucursal: row.idSucursal,
    nombre: row.nombre,
    apellidoPa: row.apellidoPa,
    apellidoMa: row.apellidoMa || "",
    telefono: row.telefono,
    fechaNac: row.fechaNac,
    email: row.email || "",
    sucursalNombre: row.sucursalNombre || "",
  };
}

export function normalizeEmpleadoPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { error: "La petición no contiene datos válidos." };
  }

  const idUsuario = parsePositiveInt(payload.idUsuario);
  const idSucursal = parsePositiveInt(payload.idSucursal);
  const nombre = normalizeString(payload.nombre);
  const apellidoPa = normalizeString(payload.apellidoPa);
  const apellidoMa = normalizeString(payload.apellidoMa);
  const telefono = normalizeString(payload.telefono);
  const fechaNac = normalizeString(payload.fechaNac);

  if (!idUsuario) {
    return { error: "El id de usuario es obligatorio." };
  }
  if (!idSucursal) {
    return { error: "El id de sucursal es obligatorio." };
  }
  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }
  if (!apellidoPa) {
    return { error: "El apellido paterno es obligatorio." };
  }
  if (!telefono) {
    return { error: "El teléfono es obligatorio." };
  }
  if (!fechaNac) {
    return { error: "La fecha de nacimiento es obligatoria." };
  }

  return {
    data: {
      idUsuario,
      idSucursal,
      nombre,
      apellidoPa,
      apellidoMa: apellidoMa || null,
      telefono,
      fechaNac,
    },
  };
}

export function parseNumericId(value) {
  return parsePositiveInt(value);
}

export async function getEmpleadoById(executor, idEmpleado) {
  const [rows] = await executor.query(
    `${BASE_SELECT_EMPLEADOS} WHERE e.idEmpleado = ? LIMIT 1`,
    [idEmpleado]
  );

  if (!rows.length) return null;
  return mapEmpleado(rows[0]);
}
