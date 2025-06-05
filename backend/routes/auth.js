const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// 🔐 Hasheá la contraseña una sola vez (esto en real se guarda en DB)
const usuarios = [
  {
    usuario: 'admin',
    contraseña: bcrypt.hashSync('1234', 10), // hash de '1234'
  },
  {
    usuario: 'chino',
    contraseña: bcrypt.hashSync('pelado', 10), // hash de 'pelado'
  },
];

router.post('/login', async (req, res) => {
  const { usuario, contraseña } = req.body;

  const encontrado = usuarios.find(u => u.usuario === usuario);

  if (!encontrado) {
    return res.status(401).json({ success: false, mensaje: 'Usuario no encontrado' });
  }

  const coincide = await bcrypt.compare(contraseña, encontrado.contraseña);

  if (coincide) {
    res.json({ success: true, mensaje: 'Login exitoso', usuario: encontrado.usuario });
  } else {
    res.status(401).json({ success: false, mensaje: 'Contraseña incorrecta' });
  }
});

module.exports = router;
