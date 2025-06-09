// backend/routes/compras.js
const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * GET /api/compras/list
 * Lista todas las órdenes de compra generadas.
 */
router.get('/list', (req, res) => {
  db.all(
    `SELECT c.id, c.stock_id, s.producto, c.cantidad_solicitada, c.fecha
     FROM compras c
     JOIN stock s ON s.id = c.stock_id
     ORDER BY c.fecha DESC;`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, mensaje: 'Error al obtener compras.' });
      }
      res.json({ success: true, compras: rows });
    }
  );
});

/**
 * POST /api/compras/create
 * Crear manualmente una orden de compra (opcional).
 */
router.post('/create', (req, res) => {
  const { stock_id, cantidad_solicitada } = req.body;
  if (!stock_id || cantidad_solicitada == null || cantidad_solicitada <= 0) {
    return res.status(400).json({ success: false, mensaje: 'Datos inválidos.' });
  }
  db.run(
    `INSERT INTO compras (stock_id, cantidad_solicitada) VALUES (?, ?);`,
    [stock_id, cantidad_solicitada],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, mensaje: 'Error al crear compra.' });
      }
      res.json({ success: true, mensaje: 'Orden de compra creada', id: this.lastID });
    }
  );
});

module.exports = router;
