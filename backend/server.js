const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

console.log('Carregando authRoutes...');
app.use('/api/auth', authRoutes);
console.log('authRoutes carregada');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'Fundo Fixo CE'
  });
});

app.listen(3001, () => {
  console.log('API executando na porta 3001');
});

setInterval(() => {
  console.log('API viva');
}, 5000);