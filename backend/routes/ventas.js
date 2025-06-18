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

// Devuelve un ranking de los productos más vendidos en base a los pedidos entregados
router.get('/mas-vendidos', (req, res) => {
  db.all(`SELECT descripcion FROM pedidos WHERE entregado = 1;`, [], (err, rows) => {
    if (err) {
      console.error('Error al obtener productos vendidos:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener productos vendidos.' });
    }

    const conteo = {};
    rows.forEach(r => {
      if (!r.descripcion) return;
      r.descripcion.split(',').forEach(part => {
        const match = part.trim().match(/^(\d+)\s*x\s*(.+)$/i);
        if (match) {
          const cantidad = parseInt(match[1], 10);
          const nombre = match[2];
          conteo[nombre] = (conteo[nombre] || 0) + cantidad;
        }
      });
    });

    const top = Object.entries(conteo)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);

    res.json({ success: true, top });
  });
});

module.exports = router;