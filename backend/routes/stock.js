// backend/routes/stock.js
const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * GET /api/stock/list
 */
router.get('/list', (req, res) => {
  db.all(
    `SELECT id, producto, cantidad, minimo, precio_unitario, categoria
     FROM stock
     ORDER BY producto COLLATE NOCASE;`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, mensaje: 'Error al obtener stock.' });
      }
      res.json({ success: true, stock: rows });
    }
  );
});

/**
 * POST /api/stock/create
 */
router.post('/create', (req, res) => {
  const { producto, cantidad, minimo, precio_unitario, categoria } = req.body;
  if (!producto || cantidad == null || precio_unitario == null || minimo == null) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos obligatorios.' });
  }
  db.run(
    `INSERT INTO stock (producto, cantidad, minimo, precio_unitario, categoria)
     VALUES (?, ?, ?, ?, ?);`,
    [producto.trim(), cantidad, minimo, precio_unitario, categoria || null],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, mensaje: 'No se pudo crear ítem.' });
      }
      res.json({ success: true, mensaje: 'Ítem creado', id: this.lastID });
    }
  );
});

/**
 * PUT /api/stock/update/:id
 */
router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { producto, cantidad, minimo, precio_unitario, categoria } = req.body;
  if (!producto || cantidad == null || precio_unitario == null || minimo == null) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos obligatorios.' });
  }
  db.run(
    `UPDATE stock 
     SET producto = ?, cantidad = ?, minimo = ?, precio_unitario = ?, categoria = ?
     WHERE id = ?;`,
    [producto.trim(), cantidad, minimo, precio_unitario, categoria || null, id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, mensaje: 'Error al actualizar ítem.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, mensaje: 'Ítem no encontrado.' });
      }
      res.json({ success: true, mensaje: 'Ítem actualizado.' });
    }
  );
});

/**
 * DELETE /api/stock/delete/:id
 */
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM stock WHERE id = ?;`, [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, mensaje: 'Error al eliminar ítem.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, mensaje: 'Ítem no encontrado.' });
    }
    res.json({ success: true, mensaje: 'Ítem eliminado.' });
  });
});

/**
 * PUT /api/stock/decrement/:id
 * Descuenta `cantidad` del stock y, si tras el descuento
 * la cantidad queda por debajo de `minimo`, crea una orden en `compras`.
 */
router.put('/decrement/:id', (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;
  if (cantidad == null || cantidad <= 0) {
    return res.status(400).json({ success: false, mensaje: 'Cantidad inválida.' });
  }

  // 1) Restar stock
  db.run(
    `UPDATE stock
     SET cantidad = cantidad - ?
     WHERE id = ? AND cantidad >= ?;`,
    [cantidad, id, cantidad],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, mensaje: 'Error al descontar stock.' });
      }
      if (this.changes === 0) {
        return res.status(400).json({ success: false, mensaje: 'Stock insuficiente o ítem no encontrado.' });
      }

      // 2) Consultar nuevo valor y mínimo
      db.get(
        `SELECT cantidad, minimo FROM stock WHERE id = ?;`,
        [id],
        (err, row) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false, mensaje: 'Error al verificar stock.' });
          }

          // 3) Si cae por debajo del mínimo, crear orden de compra
          if (row.cantidad < row.minimo) {
            const falta = row.minimo - row.cantidad;
            db.run(
              `INSERT INTO compras (stock_id, cantidad_solicitada) VALUES (?, ?);`,
              [id, falta],
              (err) => {
                if (err) console.error('Error creando compra automática:', err.message);
                // no bloqueante: no interrumpe la respuesta
              }
            );
          }

          res.json({ success: true, mensaje: 'Stock descontado correctamente.' });
        }
      );
    }
  );
});

module.exports = router;
