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
    { nombre: 'Pizza Palmito',    categoria: 'Pizza', precio: 10.0, descripcion: 'Jamón, pepperoni, aceitunas' },
    { nombre: 'Napolitana',        categoria: 'Pizza', precio: 9.0, descripcion: 'Anchoas, alcaparras, ajo' },
    { nombre: 'Coca-Cola',         categoria: 'Bebida', precio: 2.5, descripcion: 'Gaseosa 500ml' },
    { nombre: 'Agua Mineral',      categoria: 'Bebida', precio: 1.5, descripcion: '500ml' },
    { nombre: 'Pizza del Chino', categoria: 'Pizza', precio: 12.0, descripcion: 'Salsa de soja, pollo, cebolla' },
    { nombre: 'Fanta Naranja',     categoria: 'Bebida', precio: 2.5, descripcion: 'Gaseosa 500ml' },
    { nombre: 'Sprite',            categoria: 'Bebida', precio: 2.5, descripcion: 'Gaseosa 500ml' },
    { nombre: 'Pizza Vegetariana', categoria: 'Pizza', precio: 9.5, descripcion: 'Pimientos, champiñones, cebolla' },
    { nombre: 'Cerveza Artesanal', categoria: 'Bebida', precio: 3.0, descripcion: 'Lata 330ml' },
    { nombre: 'Pizza BBQ',         categoria: 'Pizza', precio: 11.0, descripcion: 'Salsa BBQ, pollo, cebolla' },
    { nombre: 'Limonada Casera',   categoria: 'Bebida', precio: 2.0, descripcion: 'Hecha con limones frescos' },
    { nombre: 'Pizza Cuatro Quesos', categoria: 'Pizza', precio: 10.5, descripcion: 'Mozzarella, azul, cabra, parmesano' },
    { nombre: 'Té Helado',         categoria: 'Bebida', precio: 1.8, descripcion: 'Lata 330ml' },
    { nombre: 'Pizza Hawaiana',    categoria: 'Pizza', precio: 9.0, descripcion: 'Piña, jamón, queso' },
    { nombre: 'Jugo de Naranja',   categoria: 'Bebida', precio: 2.0, descripcion: 'Natural 500ml' },
    { nombre: 'Pizza Picante',     categoria: 'Pizza', precio: 10.0, descripcion: 'Chorizo picante, pimientos' },
    { nombre: 'Agua con Gas',      categoria: 'Bebida', precio: 1.5, descripcion: '500ml' },
    { nombre: 'Pizza de Atún',     categoria: 'Pizza', precio: 9.0, descripcion: 'Atún, cebolla, aceitunas' },
    { nombre: 'Limonada con Hierbabuena', categoria: 'Bebida', precio: 2.5, descripcion: 'Fresca y aromática' },
    { nombre: 'Pizza de Champiñones', categoria: 'Pizza', precio: 8.5, descripcion: 'Champiñones frescos, queso' },
    { nombre: 'Batido de Fresa',   categoria: 'Bebida', precio: 3.0, descripcion: 'Fresa y yogur natural' },
    { nombre: 'Pizza de Pimiento', categoria: 'Pizza', precio: 8.0, descripcion: 'Pimientos asados, queso' },
    { nombre: 'Cerveza Rubia',     categoria: 'Bebida', precio: 2.5, descripcion: 'Lata 330ml' },
    { nombre: 'Pizza de Salchicha', categoria: 'Pizza', precio: 9.0, descripcion: 'Salchicha fresca, cebolla' },
    { nombre: 'Té Verde',          categoria: 'Bebida', precio: 1.5, descripcion: 'Lata 330ml' },
    { nombre: 'Pizza de Queso Azul', categoria: 'Pizza', precio: 10.0, descripcion: 'Queso azul, nueces, miel' },
    { nombre: 'Jugo de Manzana',   categoria: 'Bebida', precio: 2.0, descripcion: 'Natural 500ml' },
    { nombre: 'Pizza de Pesto',    categoria: 'Pizza', precio: 9.5, descripcion: 'Pesto, tomate cherry, albahaca' },
    { nombre: 'Cerveza Negra',     categoria: 'Bebida', precio: 3.0, descripcion: 'Lata 330ml' },
    { nombre: 'Pizza de Pollo al Limón', categoria: 'Pizza', precio: 11.0, descripcion: 'Pollo marinado, limón, cebolla' },
    { nombre: 'Limonada con Jengibre', categoria: 'Bebida', precio: 2.5, descripcion: 'Refrescante y picante' },
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

  db.run(`CREATE TABLE IF NOT EXISTS recetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    FOREIGN KEY(producto_id) REFERENCES productos(id),
    FOREIGN KEY(stock_id) REFERENCES stock(id)
  );`, err => {
    if (err) console.error('Error creando tabla recetas:', err.message);
    else console.log('✅ Tabla "recetas" lista');
  }
  );

  // Seed inicial de recetas para pizzas
  const recetaDefaults = [
    // Pizza Margherita
    { producto_id: 1, stock_id: 1, cantidad: 1 }, // Tomate
    { producto_id: 1, stock_id: 2, cantidad: 1 }, // Queso Mozzarella
    { producto_id: 1, stock_id: 3, cantidad: 1 }, // Albahaca
    // Pizza Palmito
    { producto_id: 2, stock_id: 4, cantidad: 1 }, // Jamón
    { producto_id: 2, stock_id: 5, cantidad: 1 }, // Pepperoni
    { producto_id: 2, stock_id: 6, cantidad: 1 }, // Aceitunas
    // Napolitana
    { producto_id: 3, stock_id: 7, cantidad: 1 }, // Anchoas
    { producto_id: 3, stock_id: 8, cantidad: 1 }, // Alcaparras
    { producto_id: 3, stock_id: 9, cantidad: 1 }, // Ajo
    // Pizza del Chino
    { producto_id: 6, stock_id: 10, cantidad: 1 }, // Salsa de Soja
    { producto_id: 6, stock_id: 11, cantidad: 1 }, // Pollo
    { producto_id: 6, stock_id: 12, cantidad: 1 }, // Cebolla
    // Pizza Vegetariana
    { producto_id: 9, stock_id: 13, cantidad: 1 }, // Pimientos
    { producto_id: 9, stock_id: 14, cantidad: 1 }, // Champiñones
    { producto_id: 9, stock_id: 15, cantidad: 1 }, // Cebolla
    // Pizza BBQ
    { producto_id: 11, stock_id: 16, cantidad: 1 }, // Salsa BBQ
    { producto_id: 11, stock_id: 17, cantidad: 1 }, // Pollo
    { producto_id: 11, stock_id: 18, cantidad: 1 }, // Cebolla
    // Pizza Cuatro Quesos
    { producto_id: 14, stock_id: 19, cantidad: 1 }, // Mozzarella
    { producto_id: 14, stock_id: 20, cantidad: 1 }, // Queso Azul
    { producto_id: 14, stock_id: 21, cantidad: 1 }, // Queso de Cabra
    { producto_id: 14, stock_id: 22, cantidad: 1 }, // Parmesano
    // Pizza Hawaiana
    { producto_id: 16, stock_id: 23, cantidad: 1 }, // Piña
    { producto_id: 16, stock_id: 24, cantidad: 1 }, // Jamón
    { producto_id: 16, stock_id: 25, cantidad: 1 }, // Queso
    // Pizza Picante
    { producto_id: 18, stock_id: 26, cantidad: 1 }, // Chorizo Picante
    { producto_id: 18, stock_id: 27, cantidad: 1 }, // Pimientos
    // Pizza de Atún
    { producto_id: 20, stock_id: 28, cantidad: 1 }, // Atún
    { producto_id: 20, stock_id: 29, cantidad: 1 }, // Cebolla
    { producto_id: 20, stock_id: 30, cantidad: 1 }, // Aceitunas
    // Pizza de Champiñones
    { producto_id: 22, stock_id: 31, cantidad: 1 }, // Champiñones Frescos
    { producto_id: 22, stock_id: 32, cantidad: 1 }, // Queso
    // Pizza de Pimiento
    { producto_id: 24, stock_id: 33, cantidad: 1 }, // Pimientos Asados
    { producto_id: 24, stock_id: 34, cantidad: 1 }, // Queso
    // Pizza de Salchicha
    { producto_id: 26, stock_id: 35, cantidad: 1 }, // Salchicha Fresca
    { producto_id: 26, stock_id: 36, cantidad: 1 }, // Cebolla
    // Pizza de Queso Azul
    { producto_id: 28, stock_id: 37, cantidad: 1 }, // Queso Azul
    { producto_id: 28, stock_id: 38, cantidad: 1 }, // Nueces
    { producto_id: 28, stock_id: 39, cantidad: 1 }, // Miel
    // Pizza de Pesto
    { producto_id: 30, stock_id: 40, cantidad: 1 }, // Pesto
    { producto_id: 30, stock_id: 41, cantidad: 1 }, // Tomate Cherry
    { producto_id: 30, stock_id: 42, cantidad: 1 }, // Albahaca
    // Pizza de Pollo al Limón
    { producto_id: 32, stock_id: 43, cantidad: 1 }, // Pollo Marinado
    { producto_id: 32, stock_id: 44, cantidad: 1 }, // Limón
    { producto_id: 32, stock_id: 45, cantidad: 1 }, // Cebolla
  ]
  recetaDefaults.forEach(r => {
    db.get(`SELECT id FROM recetas WHERE producto_id = ? AND stock_id = ?;`, [r.producto_id, r.stock_id], (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        db.run(
          `INSERT INTO recetas (producto_id, stock_id, cantidad) VALUES (?, ?, ?);`,
          [r.producto_id, r.stock_id, r.cantidad],
          function(err) {
            if (err) console.error(err.message);
            else console.log(`🍕 Receta para producto ID ${r.producto_id} creada con stock ID ${r.stock_id}`);
          }
        );
      }
    });
  })
});

module.exports = db;
