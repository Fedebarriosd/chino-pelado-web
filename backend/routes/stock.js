const express = require('express');
const db = require('../db'); // Instancia de SQLite (db.js)
const router = express.Router();

/**
 * GET /api/stock/list
 * Devuelve todos los ítems de stock (entrenados en la tabla stock).
 * Responde con JSON: { success: true, stock: [ { id, producto, cantidad, precio_unitario, categoria }, ... ] }
 */
router.get('/list', (req, res) => {
  const sql = `
    SELECT 
      id,
      producto,
      cantidad,
      precio_unitario,
      categoria
    FROM stock
    ORDER BY producto COLLATE NOCASE;
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error al listar stock:', err.message);
      return res.status(500).json({ success: false, mensaje: 'Error al obtener stock' });
    }
    res.json({ success: true, stock: rows });
  });
});

/**
 * POST /api/stock/create
 * Recibe en el body JSON: { producto, cantidad, precio_unitario, categoria }
 * Crea un nuevo registro en la tabla stock.
 * Responde con JSON: { success: true, mensaje: 'Ítem creado', id: <nuevoId> }
 */
router.post('/create', (req, res) => {
  const { producto, cantidad, precio_unitario, categoria } = req.body;

  // Validación mínima
  if (
    !producto ||
    cantidad == null || // incluye 0, pero "null" o "undefined" no
    precio_unitario == null
  ) {
    return res
      .status(400)
      .json({ success: false, mensaje: 'Faltan datos obligatorios' });
  }

  const sql = `
    INSERT INTO stock (producto, cantidad, precio_unitario, categoria)
    VALUES (?, ?, ?, ?);
  `;
  const params = [
    producto.trim(),
    parseInt(cantidad, 10),
    parseFloat(precio_unitario),
    categoria ? categoria.trim() : null,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error al insertar en stock:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'No se pudo crear el ítem' });
    }
    // this.lastID contiene el ID del nuevo registro
    res.json({ success: true, mensaje: 'Ítem creado', id: this.lastID });
  });
});

/**
 * PUT /api/stock/update/:id
 * Recibe en el body JSON: { producto, cantidad, precio_unitario, categoria }
 * Actualiza el registro cuyo id viene por params.
 * Responde con JSON: { success: true, mensaje: 'Ítem actualizado' }
 */
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { producto, cantidad, precio_unitario, categoria } = req.body;

  // Validación mínima
  if (
    !producto ||
    cantidad == null ||
    precio_unitario == null
  ) {
    return res
      .status(400)
      .json({ success: false, mensaje: 'Faltan datos obligatorios' });
  }

  const sql = `
    UPDATE stock
    SET producto = ?, cantidad = ?, precio_unitario = ?, categoria = ?
    WHERE id = ?;
  `;
  const params = [
    producto.trim(),
    parseInt(cantidad, 10),
    parseFloat(precio_unitario),
    categoria ? categoria.trim() : null,
    id,
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error al actualizar stock:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'No se pudo actualizar el ítem' });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ success: false, mensaje: 'Ítem no encontrado' });
    }
    res.json({ success: true, mensaje: 'Ítem actualizado' });
  });
});

/**
 * DELETE /api/stock/delete/:id
 * Elimina el registro de stock con el id que se pasa en params.
 * Responde con JSON: { success: true, mensaje: 'Ítem eliminado' }
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM stock WHERE id = ?;`;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Error al eliminar ítem de stock:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'No se pudo eliminar el ítem' });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ success: false, mensaje: 'Ítem no encontrado' });
    }
    res.json({ success: true, mensaje: 'Ítem eliminado' });
  });
});

module.exports = router;
