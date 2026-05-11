import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// OBTENER UN SOLO ALIMENTO (Para llenar el formulario de edición)
export async function GET(request, { params }) {
  const { id } = await params; // idProducto
  try {
    const [rows] = await pool.query(`
      SELECT p.idProducto, p.nombre, p.descripcion, p.foto, p.precio 
      FROM Producto p
      INNER JOIN Alimento a ON p.idProducto = a.idProducto
      WHERE p.idProducto = ?
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Alimento no encontrado' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ACTUALIZAR UN ALIMENTO (UPDATE)
export async function PUT(request, { params }) {
  const { id } = await params; // idProducto
  try {
    const body = await request.json();
    const { nombre, descripcion, precio } = body;

    // Actualizamos la tabla Producto
    await pool.query(
      `UPDATE Producto SET nombre = ?, descripcion = ?, precio = ? WHERE idProducto = ?`,
      [nombre, descripcion, precio, id]
    );

    return NextResponse.json({ mensaje: 'Alimento actualizado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// ELIMINACIÓN LÓGICA (Cambiar estatus a 0)
export async function DELETE(request, { params }) {
  const { id } = await params; // idProducto
  try {
    // Cambiamos el estatus a 0 (Inactivo) en lugar de borrarlo
    await pool.query(
      `UPDATE Producto SET estatus = 0 WHERE idProducto = ?`,
      [id]
    );

    return NextResponse.json({ mensaje: 'Alimento eliminado lógicamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}