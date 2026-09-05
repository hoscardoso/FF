const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const router = express.Router();

const dbPath = path.join(
  __dirname,
  '..',
  'database',
  'fundofixo.db'
);

const db = new sqlite3.Database(dbPath);

const JWT_SECRET = 'fundofixo-ce-2026';

router.get('/test', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Rota de autenticação funcionando'
  });
});

router.post('/login', (req, res) => {

  const { usuario, senha } = req.body;

  db.get(
    'SELECT * FROM users WHERE usuario = ? AND ativo = 1',
    [usuario],
    async (err, user) => {

      if (err) {
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro interno'
        });
      }

      if (!user) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        });
      }

      const senhaValida = await bcrypt.compare(
        senha,
        user.senha
      );

      if (!senhaValida) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Senha inválida'
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          usuario: user.usuario,
          perfil: user.perfil
        },
        JWT_SECRET,
        {
          expiresIn: '8h'
        }
      );

      res.json({
        sucesso: true,
        token,
        usuario: {
          nome: user.nome,
          usuario: user.usuario,
          perfil: user.perfil
        }
      });
    }
  );
});

module.exports = router;