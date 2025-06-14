const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * POST /api/pedidos/create
 * Crea un pedido nuevo con { cliente, items: [{ productId, cantidad }] } en el body,
 * genera descripción automática y descuenta ingredientes de stock.
 */
router.post('/create', (req, res) => {
  const { cliente, items } = req.body;
  if (!cliente?.trim() || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, mensaje: 'Faltan datos: cliente y lista de productos.' });
  }

  // Generar descripción automática
  const descripcion = items
    .map(item => `${item.cantidad} x ${item.nombre || `ID#${item.productId}`}`)
    .join(', ');

  // Insertar pedido
  const sqlInsert = `INSERT INTO pedidos (cliente, descripcion) VALUES (?, ?);`;
  db.run(sqlInsert, [cliente.trim(), descripcion], function (err) {
    if (err) {
      console.error('Error al insertar pedido:', err.message);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al crear pedido.' });
    }

    const pedidoId = this.lastID;

    // Descontar ingredientes según receta
    items.forEach(item => {
      const { productId, cantidad } = item;
      db.all(
        `SELECT stock_id, cantidad AS unidades_por_unidad FROM recetas WHERE producto_id = ?;`,
        [productId],
        (err, recetas) => {
          if (err) {
            console.error('Error al obtener receta:', err.message);
            return;
          }
          recetas.forEach(r => {
            const total = r.unidades_por_unidad * cantidad;
            db.run(
              `UPDATE stock SET cantidad = cantidad - ? WHERE id = ?;`,
              [total, r.stock_id],
              err => {
                if (err) console.error('Error al descontar stock:', err.message);
              }
            );
          });
        }
      );
    });

    res.json({ success: true, mensaje: 'Pedido creado y stock actualizado.', id: pedidoId });
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
 * Devuelve todos los pedidos, incluyendo su estado.
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
 * Marca como entregado (entregado = 1) el pedido con id dado.
 */
router.put('/marcar-entregado/:id', (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE pedidos SET entregado = 1 WHERE id = ?;`;
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
    res.json({ success: true, mensaje: 'Pedido marcado como completado.' });
  });
});

module.exports = router;
