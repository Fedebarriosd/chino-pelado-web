const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/historial', (req, res) => {
  const sql = `
    SELECT id, cliente, descripcion, fecha
    FROM pedidos
    WHERE entregado = 1
    ORDER BY fecha DESC;
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener historial de ventas:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener historial de ventas.' });
    }
    res.json({ success: true, historial: rows });
  });
});

module.exports = router;