const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
      SELECT *
      FROM cards
      ORDER BY responsavel
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          sucesso: false,
        });
      }

      res.json(rows);
    }
  );
});

router.post('/', (req, res) => {
  const {
    responsavel,
    conta,
  } = req.body;

  db.run(
    `
      INSERT INTO cards
      (
        responsavel,
        conta,
        ativo
      )
      VALUES (?, ?, 1)
    `,
    [
      responsavel,
      conta,
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

module.exports = router;