const express = require('express');
const pool = require('../db');
const { autenticar, autenticarQualquer } = require('../middleware/auth');
const { HORARIOS_PADRAO, SERVICOS_VALIDOS } = require('../config');

const router = express.Router();
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function ultimoDiaDoMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

router.get('/disponibilidade', async (req, res) => {
  const ano = Number(req.query.ano);
  const mes = Number(req.query.mes);

  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return res.status(400).json({ erro: 'Informe ano e mês válidos.' });
  }

  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaDoMes(ano, mes)).padStart(2, '0')}`;

  const [ocupados] = await pool.query(
    "SELECT DATE_FORMAT(data, '%Y-%m-%d') AS data, horario FROM agendamentos WHERE data BETWEEN ? AND ?",
    [inicio, fim]
  );

  const ocupadosPorData = {};
  ocupados.forEach((item) => {
    if (!ocupadosPorData[item.data]) ocupadosPorData[item.data] = [];
    ocupadosPorData[item.data].push(item.horario.slice(0, 5));
  });

  const disponibilidade = {};
  const totalDias = ultimoDiaDoMes(ano, mes);
  for (let dia = 1; dia <= totalDias; dia += 1) {
    const data = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const ocupadosNoDia = ocupadosPorData[data] || [];
    disponibilidade[data] = HORARIOS_PADRAO.filter((h) => !ocupadosNoDia.includes(h));
  }

  res.json(disponibilidade);
});

router.post('/', autenticar('cliente'), async (req, res) => {
  const data = String(req.body.data || '');
  const horario = String(req.body.horario || '');
  const servico = String(req.body.servico || '');

  if (!DATA_REGEX.test(data) || !HORARIOS_PADRAO.includes(horario)) {
    return res.status(400).json({ erro: 'Data ou horário inválido.' });
  }
  if (!SERVICOS_VALIDOS.includes(servico)) {
    return res.status(400).json({ erro: 'Escolha um serviço válido.' });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataAgendamento = new Date(`${data}T00:00:00`);
  if (dataAgendamento < hoje) {
    return res.status(400).json({ erro: 'Não é possível agendar em uma data passada.' });
  }

  try {
    const [resultado] = await pool.query(
      'INSERT INTO agendamentos (cliente_id, data, horario, servico) VALUES (?, ?, ?, ?)',
      [req.usuario.id, data, horario, servico]
    );
    return res.status(201).json({ id: resultado.insertId, data, horario, servico, status: 'confirmado' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Este horário acabou de ser reservado por outra pessoa.' });
    }
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ erro: 'Erro ao confirmar agendamento. Tente novamente.' });
  }
});

router.get('/minhas', autenticar('cliente'), async (req, res) => {
  const [linhas] = await pool.query(
    "SELECT id, DATE_FORMAT(data, '%Y-%m-%d') AS data, horario, servico, status FROM agendamentos WHERE cliente_id = ? ORDER BY data, horario",
    [req.usuario.id]
  );
  res.json(linhas.map((item) => ({ ...item, horario: item.horario.slice(0, 5) })));
});

router.get('/', autenticar('profissional'), async (req, res) => {
  const ano = Number(req.query.ano);
  const mes = Number(req.query.mes);

  let filtroData = '';
  const params = [];
  if (Number.isInteger(ano) && Number.isInteger(mes) && mes >= 1 && mes <= 12) {
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDiaDoMes(ano, mes)).padStart(2, '0')}`;
    filtroData = 'WHERE a.data BETWEEN ? AND ?';
    params.push(inicio, fim);
  }

  const [linhas] = await pool.query(
    `SELECT a.id, DATE_FORMAT(a.data, '%Y-%m-%d') AS data, a.horario, a.servico, a.status,
            c.nome AS cliente_nome, c.telefone AS cliente_telefone
     FROM agendamentos a
     JOIN clientes c ON c.id = a.cliente_id
     ${filtroData}
     ORDER BY a.data, a.horario`,
    params
  );

  res.json(linhas.map((item) => ({
    id: item.id,
    data: item.data,
    horario: item.horario.slice(0, 5),
    servico: item.servico,
    status: item.status,
    cliente: { nome: item.cliente_nome, telefone: item.cliente_telefone }
  })));
});

router.delete('/:id', autenticarQualquer, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const [linhas] = await pool.query('SELECT id, cliente_id FROM agendamentos WHERE id = ?', [id]);
  const agendamento = linhas[0];
  if (!agendamento) {
    return res.status(404).json({ erro: 'Agendamento não encontrado.' });
  }

  if (req.usuario.papel === 'cliente' && agendamento.cliente_id !== req.usuario.id) {
    return res.status(403).json({ erro: 'Você não pode cancelar este agendamento.' });
  }
  if (req.usuario.papel !== 'cliente' && req.usuario.papel !== 'profissional') {
    return res.status(403).json({ erro: 'Acesso não permitido.' });
  }

  await pool.query('DELETE FROM agendamentos WHERE id = ?', [id]);
  res.status(204).end();
});

module.exports = router;