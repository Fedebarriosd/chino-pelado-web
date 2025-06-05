const express = require('express');
const db = require('../db');
const router = express.Router();

// 1) Crear un pedido nuevo
router.post('/create', (req, res) => {
  const { cliente, descripcion } = req.body;
  if (!cliente || !descripcion) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos' });
  }

  db.run(
    `INSERT INTO pedidos (cliente, descripcion) VALUES (?, ?)`,
    [cliente, descripcion],
    function (err) {
      if (err) {
        console.error('Error al insertar pedido:', err.message);
        return res.status(500).json({ success: false, mensaje: 'Error al crear pedido' });
      }
      return res.json({
        success: true,
        mensaje: 'Pedido creado',
        id: this.lastID,
      });
    }
  );
});

// 2) Listar todos los pedidos pendientes (entregado = 0)
router.get('/list-pendientes', (req, res) => {
  db.all(
    `SELECT id, cliente, descripcion, fecha FROM pedidos WHERE entregado = 0 ORDER BY fecha DESC`,
    (err, rows) => {
      if (err) {
        console.error('Error al listar pedidos:', err.message);
        return res.status(500).json({ success: false, mensaje: 'Error al obtener pedidos' });
      }
      return res.json({ success: true, pedidos: rows });
    }
  );
});

// 3) Marcar un pedido como entregado
router.put('/marcar-entregado/:id', (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE pedidos SET entregado = 1 WHERE id = ?`,
    [id],
    function (err) {
      if (err) {
        console.error('Error al marcar entregado:', err.message);
        return res
          .status(500)
          .json({ success: false, mensaje: 'Error al actualizar pedido' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, mensaje: 'Pedido no encontrado' });
      }
      return res.json({ success: true, mensaje: 'Pedido marcado como entregado' });
    }
  );
});

// 4) (Opcional) Listar todos los pedidos (incluye entregados)
router.get('/list-todos', (req, res) => {
  db.all(
    `SELECT id, cliente, descripcion, fecha, entregado FROM pedidos ORDER BY fecha DESC`,
    (err, rows) => {
      if (err) {
        console.error('Error al listar todos los pedidos:', err.message);
        return res.status(500).json({ success: false, mensaje: 'Error al obtener pedidos' });
      }
      return res.json({ success: true, pedidos: rows });
    }
  );
});

module.exports = router;
