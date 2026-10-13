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
      FROM card_usage
      ORDER BY created_at DESC
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
    card_id,
    data_retirada,
    hora_retirada,
    quem_retirou,
    finalidade,
    observacao,
    data_devolucao,
    hora_devolucao,
  } = req.body;

  db.run(
    `
      INSERT INTO card_usage
      (
        card_id,
        data_retirada,
        hora_retirada,
        quem_retirou,
        finalidade,
        observacao,
        data_devolucao,
        hora_devolucao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      card_id,
      data_retirada,
      hora_retirada,
      quem_retirou,
      finalidade,
      observacao,
      data_devolucao,
      hora_devolucao,
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
  res.json({
    sucesso: true,
  });
});

router.delete('/:id', (req, res) => {
  db.run(
    `
      DELETE FROM card_usage
      WHERE id = ?
    `,
    [req.params.id],
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