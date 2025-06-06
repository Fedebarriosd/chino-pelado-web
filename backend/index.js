const express = require('express');
const cors = require('cors');
require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pedidosRoutes = require('./routes/pedidos');
const stockRoutes = require('./routes/stock');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/stock', stockRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
