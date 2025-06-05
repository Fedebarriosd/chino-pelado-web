// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // ← Importamos nuestra instancia de SQLite
const router = express.Router();

router.post('/login', (req, res) => {
  const { usuario, contraseña } = req.body;
  if (!usuario || !contraseña) {
    return res.status(400).json({ success: false, mensaje: 'Faltan credenciales' });
  }

  // 1) Buscamos al usuario en la tabla
  db.get(
    `SELECT * FROM usuarios WHERE usuario = ?`,
    [usuario],
    async (err, row) => {
      if (err) {
        console.error('Error SQL al buscar usuario:', err.message);
        return res.status(500).json({ success: false, mensaje: 'Error interno de servidor' });
      }

      // 2) Si no existe ningún registro con ese nombre
      if (!row) {
        return res.status(401).json({ success: false, mensaje: 'Usuario no encontrado' });
      }

      // 3) row.contraseña es el hash almacenado; comparamos con bcrypt
      const coincide = await bcrypt.compare(contraseña, row.contraseña);
      if (!coincide) {
        return res.status(401).json({ success: false, mensaje: 'Contraseña incorrecta' });
      }

      // 4) Si coincide: devolvemos éxito y el rol para frontend
      return res.json({
        success: true,
        mensaje: 'Login exitoso',
        usuario: row.usuario,
        rol: row.rol,
      });
    }
  );
});

module.exports = router;
