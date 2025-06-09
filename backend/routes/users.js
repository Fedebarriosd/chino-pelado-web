// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// 1) Crear usuario (ya lo tienes)

router.post('/create', async (req, res) => {
  const { usuario, contraseña, rol } = req.body;
  if (!usuario || !contraseña || !rol) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos.' });
  }
  try {
    const hash = await bcrypt.hash(contraseña, 10);
    const sql = `INSERT INTO usuarios (usuario, contraseña, rol) VALUES (?, ?, ?);`;
    db.run(sql, [usuario.trim(), hash, rol], function(err) {
      if (err) {
        return res.status(500).json({ success: false, mensaje: 'Usuario duplicado o error.' });
      }
      res.json({ success: true, mensaje: 'Usuario creado', id: this.lastID });
    });
  } catch {
    res.status(500).json({ success: false, mensaje: 'Error al cifrar contraseña.' });
  }
});

// 2) Listar solo usuarios activos

router.get('/list', (req, res) => {
  db.all(
    `SELECT id, usuario, rol, activo FROM usuarios WHERE activo = 1 ORDER BY usuario;`,
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al listar.' });
      res.json({ success: true, usuarios: rows });
    }
  );
});

// 3) Actualizar usuario

router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario: nuevoUsuario, rol: nuevoRol } = req.body;
  if (!nuevoUsuario || !nuevoRol) {
    return res.status(400).json({ success: false, mensaje: 'Faltan datos.' });
  }
  const sql = `
    UPDATE usuarios
    SET usuario = ?, rol = ?
    WHERE id = ?;
  `;
  db.run(sql, [nuevoUsuario.trim(), nuevoRol, id], function(err) {
    if (err) return res.status(500).json({ success: false, mensaje: 'Error al actualizar.' });
    if (this.changes === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }
    res.json({ success: true, mensaje: 'Usuario actualizado.' });
  });
});

// 4) Soft-delete (desactivar usuario)

router.put('/deactivate/:id', (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE usuarios SET activo = 0 WHERE id = ?;`,
    [id],
    function(err) {
      if (err) return res.status(500).json({ success: false, mensaje: 'Error al desactivar.' });
      if (this.changes === 0) {
        return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
      }
      res.json({ success: true, mensaje: 'Usuario desactivado.' });
    }
  );
});

module.exports = router;
