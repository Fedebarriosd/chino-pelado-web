const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * GET /api/recetas/:productoId
 * Devuelve los ingredientes (stock_id, nombre del ingrediente y cantidad)
 * necesarios para preparar una unidad del producto indicado.
 */
router.get('/:productoId', (req, res) => {
  const { productoId } = req.params;
  const sql = `
    SELECT
      r.stock_id,
      s.producto   AS ingrediente,
      r.cantidad   AS unidades
    FROM recetas r
    JOIN stock s ON s.id = r.stock_id
    WHERE r.producto_id = ?
  `;
  db.all(sql, [productoId], (err, rows) => {
    if (err) {
      console.error('Error al obtener receta:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener receta.' });
    }
    res.json({ success: true, receta: rows });
  });
});

module.exports = router;
