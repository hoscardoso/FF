const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(
  __dirname,
  '..',
  'database',
  'fundofixo.db'
);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    UPDATE users
    SET nome = 'Tamara Cardoso'
    WHERE usuario = 'tsales'
  `);

  db.run(`
    UPDATE users
    SET nome = 'Wandrecreia Botelho'
    WHERE usuario = 'secretariace'
  `);

  db.run(`
    UPDATE users
    SET nome = 'Bp Fernando Souza'
    WHERE usuario = 'hfsouza'
  `);

  console.log('Usuários atualizados.');
});

db.close();