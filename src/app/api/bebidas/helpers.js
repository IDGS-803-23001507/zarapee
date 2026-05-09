export const BASE_SELECT_BEBIDAS = `
  SELECT
    b.idBebida,
    p.idProducto,
    p.nombre,
    p.descripcion,
    p.foto,
    p.precio,
    p.estatus
  FROM Bebida b
  INNER JOIN Producto p ON p.idProducto = b.idProducto
  WHERE p.tipo = 'BEBIDA'
`;

export function mapBebida(row) {
  const parsedPrice = Number(row.precio);
  return {
    idBebida: row.idBebida,
    idProducto: row.idProducto,
    nombre: row.nombre,
    descripcion: row.descripcion,
    foto: normalizeFotoPath(row.foto),
    precio: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    estatus: Boolean(row.estatus),
  };
}

function normalizeFotoPath(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return "";

  const normalized = rawValue.replace(/\\/g, "/");

  if (/fakepath\//i.test(normalized)) return "";
  if (/^(https?:\/\/|data:image\/)/i.test(normalized)) return normalized;
  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("uploads/")) return `/${normalized}`;

  return normalized;
}

function parsePrecio(value) {
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (!normalized) return Number.NaN;
    return Number(normalized);
  }

  return Number(value);
}

function parseEstatus(value) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "activo", "activa"].includes(normalized)) return true;
    if (["0", "false", "inactivo", "inactiva"].includes(normalized)) return false;
  }
  return Boolean(value);
}

export function normalizeBebidaPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { error: "La petición no contiene datos válidos." };
  }

  const nombre = String(payload.nombre ?? "").trim();
  const descripcion = String(payload.descripcion ?? "").trim();
  const foto = normalizeFotoPath(payload.foto);
  const precio = parsePrecio(payload.precio);
  const estatus = parseEstatus(payload.estatus);

  if (!nombre) {
    return { error: "El nombre de la bebida es obligatorio." };
  }
  if (!descripcion) {
    return { error: "La descripción de la bebida es obligatoria." };
  }
  if (!Number.isFinite(precio) || precio < 0) {
    return { error: "El precio debe ser un número válido mayor o igual a 0." };
  }

  return {
    data: {
      nombre,
      descripcion,
      foto: foto || null,
      precio,
      estatus,
    },
  };
}

export async function getBebidaById(executor, idBebida) {
  const [rows] = await executor.query(
    `${BASE_SELECT_BEBIDAS} AND b.idBebida = ? LIMIT 1`,
    [idBebida]
  );

  if (!rows.length) return null;
  return mapBebida(rows[0]);
}

export function parseNumericId(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}
