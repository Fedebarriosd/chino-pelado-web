// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Crear nuevo usuario
router.post('/create', async (req, res) => {
  const { usuario, contraseña, rol } = req.body;
  if (!usuario || !contraseña || !rol) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos' });
  }

  try {
    const hash = await bcrypt.hash(contraseña, 10);
    db.run(
      `INSERT INTO usuarios (usuario, contraseña, rol) VALUES (?, ?, ?)`,
      [usuario, hash, rol],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res
              .status(409)
              .json({ success: false, mensaje: 'El usuario ya existe' });
          }
          return res
            .status(500)
            .json({ success: false, mensaje: 'Error al crear usuario' });
        }
        return res.json({
          success: true,
          mensaje: 'Usuario creado',
          id: this.lastID,
        });
      }
    );
  } catch (err) {
    console.error('Error al hashear contraseña:', err);
    return res.status(500).json({ success: false, mensaje: 'Error interno' });
  }
});

// Listar todos los usuarios (para completar la tabla en el frontend)
router.get('/list', (req, res) => {
  db.all(`SELECT usuario, rol FROM usuarios ORDER BY id`, (err, rows) => {
    if (err) {
      console.error('Error al listar usuarios:', err);
      return res
        .status(500)
        .json({ success: false, mensaje: 'Error al obtener lista' });
    }
    // rows = [ { usuario: 'admin', rol: 'admin' }, {...} ]
    return res.json({ success: true, usuarios: rows });
  });
});

module.exports = router;
