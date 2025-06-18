const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * POST /api/pedidos/create
 * Crea un pedido nuevo con { cliente, items: [{ productId, cantidad }] } en el body,
 * genera descripción automática y descuenta ingredientes de stock.
 * Si no hay stock suficiente de algún ingrediente, no se realiza la venta.
 */

router.post('/create', async (req, res) => {
  const { cliente, items } = req.body;
  if (!cliente?.trim() || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, mensaje: 'Faltan datos: cliente y lista de productos.' });
  }

  // Helpers promisificados para SQLite
  const runAsync = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  const allAsync = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  const getAsync = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    try {
    // Generar descripción automática
    const descripcion = items
      .map(item => `${item.cantidad} x ${item.nombre || `ID#${item.productId}`}`)
      .join(', ');

    // Calcular requerimientos totales de stock
    const requeridos = {};
    for (const item of items) {
      const recetas = await allAsync(
        `SELECT stock_id, cantidad AS unidades_por_unidad FROM recetas WHERE producto_id = ?;`,
        [item.productId]
      );
      for (const r of recetas) {
        const total = r.unidades_por_unidad * item.cantidad;
        requeridos[r.stock_id] = (requeridos[r.stock_id] || 0) + total;
      }
    }

    // Verificar stock disponible
    for (const [stockId, necesario] of Object.entries(requeridos)) {
      const row = await getAsync(`SELECT cantidad FROM stock WHERE id = ?;`, [stockId]);
      if (!row || row.cantidad < necesario) {
        return res
          .status(400)
          .json({ success: false, mensaje: 'Stock insuficiente para completar el pedido.' });
      }
    }

    // Iniciar transacción
    await runAsync('BEGIN TRANSACTION;');

    try {
      // Insertar pedido
      const result = await runAsync(
        `INSERT INTO pedidos (cliente, descripcion) VALUES (?, ?);`,
        [cliente.trim(), descripcion]
      );
      const pedidoId = result.lastID;

      // Descontar ingredientes
      for (const [stockId, qty] of Object.entries(requeridos)) {
        await runAsync(`UPDATE stock SET cantidad = cantidad - ? WHERE id = ?;`, [qty, stockId]);
      }

      await runAsync('COMMIT;');
      res.json({ success: true, mensaje: 'Pedido creado y stock actualizado.', id: pedidoId });
    } catch (err) {
      await runAsync('ROLLBACK;');
      throw err;
    }
  } catch (err) {
    console.error('Error al crear pedido:', err.message);
    res.status(500).json({ success: false, mensaje: 'Error al crear pedido.' });
  }
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
