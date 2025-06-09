// backend/routes/productos.js
const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * GET /api/productos/list
 * Devuelve todos los productos finales (pizzas, bebidas, etc.).
 */
router.get('/list', (req, res) => {
  db.all(
    `SELECT id, nombre, categoria, precio, descripcion
     FROM productos
     ORDER BY nombre COLLATE NOCASE;`,
    (err, rows) => {
      if (err) {
        console.error('Error listando productos:', err.message);
        return res.status(500).json({ success: false, mensaje: 'Error al listar productos.' });
      }
      res.json({ success: true, productos: rows });
    }
  );
});

module.exports = router;
