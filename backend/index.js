// backend/index.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes    = require('./routes/auth');
const usersRoutes   = require('./routes/users');
const pedidosRoutes = require('./routes/pedidos');
const stockRoutes   = require('./routes/stock');
const comprasRoutes = require('./routes/compras');
const productosRoutes = require('./routes/productos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/users',   usersRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/stock',   stockRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/productos', productosRoutes);

app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});
