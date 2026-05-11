import { NextResponse } from 'next/server';
import pool from '@/lib/db'; 

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.idAlimento, 
        p.idProducto, 
        p.nombre, 
        p.descripcion, 
        p.foto, 
        p.precio, 
        p.estatus 
      FROM Alimento a
      INNER JOIN Producto p ON a.idProducto = p.idProducto
      WHERE p.estatus = 1
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error al obtener alimentos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const connection = await pool.getConnection();
  
  try {
    const body = await request.json();
    const { nombre, descripcion, foto, precio } = body;

    await connection.beginTransaction();

    const [resultProducto] = await connection.query(
      `INSERT INTO Producto (nombre, descripcion, foto, precio, tipo, estatus) 
       VALUES (?, ?, ?, ?, 'ALIMENTO', 1)`,
      [nombre, descripcion, foto || null, precio]
    );

    const idProductoInsertado = resultProducto.insertId;

    const [resultAlimento] = await connection.query(
      `INSERT INTO Alimento (idProducto) VALUES (?)`,
      [idProductoInsertado]
    );

    await connection.commit();

    return NextResponse.json({ 
      mensaje: 'Alimento creado exitosamente',
      idAlimento: resultAlimento.insertId,
      idProducto: idProductoInsertado
    }, { status: 201 });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear alimento:', error);
    return NextResponse.json(
      { error: 'Error al crear el alimento' }, 
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}