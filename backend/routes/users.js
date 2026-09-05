const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const router = express.Router();

const dbPath = path.join(
  __dirname,
  '..',
  'database',
  'fundofixo.db'
);

const db = new sqlite3.Database(dbPath);

router.get('/', (req, res) => {
  db.all(
    `
      SELECT
        id,
        nome,
        usuario,
        perfil,
        ativo
      FROM users
      ORDER BY nome
    `,
    [],
    (err, rows) => {
      if (err) {
        return res
          .status(500)
          .json({ sucesso: false });
      }

      res.json(rows);
    }
  );
});

router.post('/', async (req, res) => {
  const {
    nome,
    usuario,
    senha,
    perfil,
  } = req.body;

  const senhaHash =
    await bcrypt.hash(senha, 10);

  db.run(
    `
      INSERT INTO users
      (
        nome,
        usuario,
        senha,
        perfil,
        ativo
      )
      VALUES (?, ?, ?, ?, 1)
    `,
    [
      nome,
      usuario,
      senhaHash,
      perfil,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          sucesso: false,
        });
      }

      res.json({
        sucesso: true,
        id: this.lastID,
      });
    }
  );
});

router.patch('/:id', (req, res) => {
  const {
    nome,
    perfil,
  } = req.body;

  db.run(
    `
      UPDATE users
      SET nome = ?,
          perfil = ?
      WHERE id = ?
    `,
    [
      nome,
      perfil,
      req.params.id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          sucesso: false,
        });
      }

      res.json({
        sucesso: true,
      });
    }
  );
});

router.patch('/:id/status', (req, res) => {
  const { ativo } = req.body;

  db.run(
    `
      UPDATE users
      SET ativo = ?
      WHERE id = ?
    `,
    [ativo ? 1 : 0, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          sucesso: false,
        });
      }

      res.json({
        sucesso: true,
      });
    }
  );
});

router.patch('/:id/password', async (req, res) => {
  const { senha } = req.body;

  const senhaHash =
    await bcrypt.hash(senha, 10);

  db.run(
    `
      UPDATE users
      SET senha = ?
      WHERE id = ?
    `,
    [
      senhaHash,
      req.params.id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          sucesso: false,
        });
      }

      res.json({
        sucesso: true,
      });
    }
  );
});

module.exports = router;