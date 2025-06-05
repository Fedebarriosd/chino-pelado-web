// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// 1) Ruta física al archivo .sqlite (en este caso, en la carpeta backend)
const dbPath = path.resolve(__dirname, 'chino-pelado.sqlite');

// 2) Abrir (o crear) la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Error al abrir BD:', err.message);
  console.log('✅ SQLite conectado en', dbPath);
});

// 3) En “serialize” ejecutamos las sentencias de forma secuencial
db.serialize(() => {
  // 3.1) Creación de la tabla “usuarios” si no existe
  db.run(
    `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT UNIQUE,
      contraseña TEXT,
      rol TEXT
    );`,
    (err) => {
      if (err) return console.error('Error creando tabla usuarios:', err.message);
      console.log('✅ Tabla "usuarios" lista');
    }
  );

  // 3.2) Insertar usuarios por defecto (solo si no existen)
  //      Aquí generamos los hashes con bcrypt y luego comprobamos si ya existen
  const defaults = [
    { usuario: 'admin',   pass: bcrypt.hashSync('1234', 10),   rol: 'admin' },
    { usuario: 'chino',   pass: bcrypt.hashSync('pelado', 10), rol: 'usuario' },
  ];

  for (const u of defaults) {
    db.get(
      `SELECT id FROM usuarios WHERE usuario = ?`,
      [u.usuario],
      (err, row) => {
        if (err) {
          console.error('Error comprobando usuario por defecto:', err.message);
          return;
        }
        if (!row) {
          db.run(
            `INSERT INTO usuarios (usuario, contraseña, rol) VALUES (?, ?, ?)`,
            [u.usuario, u.pass, u.rol],
            function(err) {
              if (err) return console.error('Error insertando usuario por defecto:', err.message);
              console.log(`🔒 Usuario "${u.usuario}" (rol: ${u.rol}) creado con id ${this.lastID}`);
            }
          );
        } else {
          console.log(`🔐 Usuario "${u.usuario}" ya existe, no se vuelve a insertar.`);
        }
      }
    );
  }
});

// 4) Exportar el objeto “db” para usarlo en otros módulos
module.exports = db;
