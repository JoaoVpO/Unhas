const express = require('express');
const pool = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

router.get('/', autenticar('profissional'), async (req, res) => {
  const [clientes] = await pool.query('SELECT id, nome, telefone, email, criado_em FROM clientes');
  const [profissionais] = await pool.query('SELECT id, nome, email, criado_em FROM profissionais');
  const [agendamentos] = await pool.query(
    "SELECT id, cliente_id, DATE_FORMAT(data, '%Y-%m-%d') AS data, horario, servico, status, criado_em FROM agendamentos"
  );

  const backup = {
    geradoEm: new Date().toISOString(),
    clientes,
    profissionais,
    agendamentos
  };

  const nomeArquivo = `backup-unhas-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
  res.json(backup);
});

module.exports = router;
