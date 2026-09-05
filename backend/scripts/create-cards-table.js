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
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      responsavel TEXT NOT NULL,
      conta TEXT NOT NULL,
      ativo INTEGER DEFAULT 1
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO cards
    (id,responsavel,conta,ativo)
    VALUES
    (1,'Ângela','124802273',1)
  `);

  db.run(`
    INSERT OR IGNORE INTO cards
    (id,responsavel,conta,ativo)
    VALUES
    (2,'Marlei','127616191',1)
  `);

  console.log('Tabela cards criada.');
});

db.close();