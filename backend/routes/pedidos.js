const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * POST /api/pedidos/create
 * Crea un pedido nuevo con { cliente, descripcion } en el body.
 */
router.post('/create', (req, res) => {
  const { cliente, descripcion } = req.body;
  if (!cliente || !descripcion) {
    return res
      .status(400)
      .json({ success: false, mensaje: 'Faltan datos: cliente y descripción.' });
  }

  const sql = `
    INSERT INTO pedidos (cliente, descripcion)
    VALUES (?, ?);
  `;
  db.run(sql, [cliente.trim(), descripcion.trim()], function (err) {
    if (err) {
      console.error('Error al insertar pedido:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al crear pedido.' });
    }
    res.json({
      success: true,
      mensaje: 'Pedido creado',
      id: this.lastID
    });
  });
});

/**
 * GET /api/pedidos/list-pendientes
 * Devuelve todos los pedidos con entregado = 0.
 */
router.get('/list-pendientes', (req, res) => {
  const sql = `
    SELECT id, cliente, descripcion, fecha
    FROM pedidos
    WHERE entregado = 0
    ORDER BY fecha DESC;
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error al listar pedidos pendientes:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener pedidos pendientes.' });
    }
    res.json({ success: true, pedidos: rows });
  });
});

/**
 * GET /api/pedidos/list-entregados
 * Devuelve todos los pedidos con entregado = 1.
 */
router.get('/list-entregados', (req, res) => {
  const sql = `
    SELECT id, cliente, descripcion, fecha
    FROM pedidos
    WHERE entregado = 1
    ORDER BY fecha DESC;
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error al listar pedidos entregados:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener pedidos entregados.' });
    }
    res.json({ success: true, pedidos: rows });
  });
});

/**
 * GET /api/pedidos/list-todos
 * Devuelve todos los pedidos, sin discriminar estado.
 * Cada fila trae también el campo “entregado” para saber si está 0 o 1.
 */
router.get('/list-todos', (req, res) => {
  const sql = `
    SELECT id, cliente, descripcion, fecha, entregado
    FROM pedidos
    ORDER BY fecha DESC;
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Error al listar todos los pedidos:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener lista de pedidos.' });
    }
    res.json({ success: true, pedidos: rows });
  });
});

/**
 * PUT /api/pedidos/marcar-entregado/:id
 * Marca como entregado (entregado = 1) el pedido con id = :id
 */
router.put('/marcar-entregado/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE pedidos
    SET entregado = 1
    WHERE id = ?;
  `;
  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Error al marcar entregado:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al actualizar pedido.' });
    }
    if (this.changes === 0) {
      return res
        .status(404)
        .json({ success: false, mensaje: 'Pedido no encontrado.' });
    }
    res.json({ success: true, mensaje: 'Pedido marcado como entregado.' });
  });
});

/**
 * DELETE /api/pedidos/delete/:id
 * Marca como entregado (entregado = 1) el pedido con id = :id
 * (en realidad no se elimina, solo se marca como completado)
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE pedidos SET entregado = 1 WHERE id = ?;`,
    [id],
    function(err) {
      if (err) {
        console.error('Error marcando entregado:', err);
        return res.status(500).json({ success: false, mensaje: 'Error al eliminar pedido.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, mensaje: 'Pedido no encontrado.' });
      }
      res.json({ success: true, mensaje: 'Pedido marcado como completado.' });
    }
  );
});

module.exports = router;
