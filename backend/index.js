// backend/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong desde el backend del Chino Pelado 🧄🍕' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
