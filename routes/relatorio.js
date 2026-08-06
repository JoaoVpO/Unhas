const express = require('express');
const pool = require('../db');
const { autenticar } = require('../middleware/auth');
const { PRECOS_SERVICOS, DURACAO_SERVICOS_MINUTOS } = require('../config');

const router = express.Router();

function ultimoDiaDoMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

router.get('/', autenticar('profissional'), async (req, res) => {
  const ano = Number(req.query.ano);
  const mes = Number(req.query.mes);

  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return res.status(400).json({ erro: 'Informe ano e mês válidos.' });
  }

  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaDoMes(ano, mes)).padStart(2, '0')}`;

  const [agendamentos] = await pool.query(
    "SELECT DATE_FORMAT(data, '%Y-%m-%d') AS data, servico, cliente_id FROM agendamentos WHERE data BETWEEN ? AND ?",
    [inicio, fim]
  );

  const [despesas] = await pool.query(
    'SELECT valor FROM despesas WHERE data BETWEEN ? AND ?',
    [inicio, fim]
  );

  const receitaPorServico = {};
  const clientesUnicos = new Set();
  const diasTrabalhados = new Set();
  let receitaTotal = 0;
  let minutosAtendidos = 0;

  agendamentos.forEach((item) => {
    const preco = PRECOS_SERVICOS[item.servico] || 0;
    receitaPorServico[item.servico] = (receitaPorServico[item.servico] || 0) + preco;
    receitaTotal += preco;
    minutosAtendidos += DURACAO_SERVICOS_MINUTOS[item.servico] || 0;
    clientesUnicos.add(item.cliente_id);
    diasTrabalhados.add(item.data);
  });

  const despesaTotal = despesas.reduce((soma, item) => soma + Number(item.valor), 0);

  res.json({
    receitaTotal,
    despesaTotal,
    lucro: receitaTotal - despesaTotal,
    totalAtendimentos: agendamentos.length,
    clientesAtendidos: clientesUnicos.size,
    diasTrabalhados: diasTrabalhados.size,
    minutosAtendidos,
    receitaPorServico
  });
});

module.exports = router;
