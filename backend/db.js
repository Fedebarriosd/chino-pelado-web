// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Ruta al archivo de BD
const dbPath = path.resolve(__dirname, 'chino-pelado.sqlite');
const db = new sqlite3.Database(dbPath, err => {
  if (err) return console.error('Error al abrir BD:', err.message);
  console.log('✅ SQLite conectado en', dbPath);
});

db.serialize(() => {
  // 1) Tabla Usuarios
  db.run(
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE NOT NULL,
      contraseña TEXT NOT NULL,
      rol TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    );`,
    err => {
      if (err) console.error('Error creando tabla usuarios:', err.message);
      else console.log('✅ Tabla "usuarios" lista');
    }
  );

  // Migración: agregar columna activo si falta
  db.all(`PRAGMA table_info(usuarios);`, (err, cols) => {
    if (err) return console.error(err.message);
    if (!cols.some(c => c.name === 'activo')) {
      db.run(`ALTER TABLE usuarios ADD COLUMN activo INTEGER NOT NULL DEFAULT 1;`);
      console.log('🛠 Columna "activo" añadida a "usuarios"');
    }
  });

  // Seed inicial de usuarios
  const userDefaults = [
    { usuario: 'admin', pass: bcrypt.hashSync('1234', 10), rol: 'admin' },
    { usuario: 'chino', pass: bcrypt.hashSync('pelado', 10), rol: 'usuario' },
  ];
  userDefaults.forEach(u => {
    db.get(`SELECT id FROM usuarios WHERE usuario = ?;`, [u.usuario], (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        db.run(
          `INSERT INTO usuarios (usuario, contraseña, rol) VALUES (?, ?, ?);`,
          [u.usuario, u.pass, u.rol],
          function(err) {
            if (err) console.error(err.message);
            else console.log(`🔒 Usuario "${u.usuario}" creado con id ${this.lastID}`);
          }
        );
      }
    });
  });

  // 2) Tabla Pedidos
  db.run(
    `CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT,
      descripcion TEXT,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      entregado INTEGER DEFAULT 0
    );`,
    err => {
      if (err) console.error('Error creando tabla pedidos:', err.message);
      else console.log('✅ Tabla "pedidos" lista');
    }
  );

  // 3) Tabla Stock
  db.run(
    `CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      minimo INTEGER NOT NULL DEFAULT 0,
      precio_unitario REAL NOT NULL,
      categoria TEXT
    );`,
    err => {
      if (err) console.error('Error creando tabla stock:', err.message);
      else console.log('✅ Tabla "stock" lista');
    }
  );

  // Migración: agregar columna minimo si falta
  db.all(`PRAGMA table_info(stock);`, (err, cols) => {
    if (err) return console.error(err.message);
    if (!cols.some(c => c.name === 'minimo')) {
      db.run(`ALTER TABLE stock ADD COLUMN minimo INTEGER NOT NULL DEFAULT 0;`);
      console.log('🛠 Columna "minimo" añadida a "stock"');
    }
  });

  // 4) Tabla Compras (órdenes de compra)
  db.run(
    `CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER NOT NULL,
      cantidad_solicitada INTEGER NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(stock_id) REFERENCES stock(id)
    );`,
    err => {
      if (err) console.error('Error creando tabla compras:', err.message);
      else console.log('✅ Tabla "compras" lista');
    }
  );

  // 5) Tabla Productos (catálogo de venta)
  db.run(
    `CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio REAL NOT NULL,
      descripcion TEXT
    );`,
    err => {
      if (err) console.error('Error creando tabla productos:', err.message);
      else console.log('✅ Tabla "productos" lista');
    }
  );

  // Seed inicial de productos finales
  const productDefaults = [
    { nombre: 'Pizza Margherita', categoria: 'Pizza', precio: 8.5, descripcion: 'Tomate, queso mozzarella, albahaca' },
    { nombre: 'Pizza Especial',    categoria: 'Pizza', precio: 10.0, descripcion: 'Jamón, pepperoni, aceitunas' },
    { nombre: 'Napolitana',        categoria: 'Pizza', precio: 9.0, descripcion: 'Anchoas, alcaparras, ajo' },
    { nombre: 'Coca-Cola',         categoria: 'Bebida', precio: 2.5, descripcion: 'Gaseosa 500ml' },
    { nombre: 'Agua Mineral',      categoria: 'Bebida', precio: 1.5, descripcion: '500ml' },
  ];
  productDefaults.forEach(p => {
    db.get(`SELECT id FROM productos WHERE nombre = ?;`, [p.nombre], (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        db.run(
          `INSERT INTO productos (nombre, categoria, precio, descripcion) VALUES (?, ?, ?, ?);`,
          [p.nombre, p.categoria, p.precio, p.descripcion]
        );
      }
    });
  });
});

module.exports = db;
