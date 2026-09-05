const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(
  __dirname,
  '..',
  'database',
  'fundofixo.db'
);

const db = new sqlite3.Database(dbPath);

async function init() {
  db.serialize(async () => {

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        usuario TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        perfil TEXT NOT NULL,
        ativo INTEGER DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const senhaPadrao = await bcrypt.hash('123456', 10);

    const usuarios = [
      ['Oscar Cardoso', 'oscardoso', senhaPadrao, 'MASTER'],
      ['Thiago Sales', 'tsales', senhaPadrao, 'ADMIN'],
      ['Secretaria CE', 'secretariace', senhaPadrao, 'USER'],
      ['HF Souza', 'hfsouza', senhaPadrao, 'USER']
    ];

    usuarios.forEach((u) => {
      db.run(
        `
        INSERT OR IGNORE INTO users
        (nome, usuario, senha, perfil)
        VALUES (?, ?, ?, ?)
      `,
        u
      );
    });

    console.log('Banco inicializado com sucesso.');
    console.log('Usuários criados.');
    console.log('Senha inicial: 123456');
  });
}

init();