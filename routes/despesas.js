const express = require('express');
const pool = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

router.get('/', autenticar('profissional'), async (req, res) => {
  const ano = Number(req.query.ano);
  const mes = Number(req.query.mes);

  let filtroData = '';
  const params = [];
  if (Number.isInteger(ano) && Number.isInteger(mes) && mes >= 1 && mes <= 12) {
    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(new Date(ano, mes, 0).getDate()).padStart(2, '0')}`;
    filtroData = 'WHERE data BETWEEN ? AND ?';
    params.push(inicio, fim);
  }

  const [linhas] = await pool.query(
    `SELECT id, descricao, valor, DATE_FORMAT(data, '%Y-%m-%d') AS data FROM despesas ${filtroData} ORDER BY data DESC, id DESC`,
    params
  );

  res.json(linhas);
});

router.post('/', autenticar('profissional'), async (req, res) => {
  const descricao = String(req.body.descricao || '').trim();
  const valor = Number(req.body.valor);
  const data = String(req.body.data || '');

  if (!descricao) {
    return res.status(400).json({ erro: 'Informe a descrição da despesa.' });
  }
  if (!Number.isFinite(valor) || valor <= 0) {
    return res.status(400).json({ erro: 'Informe um valor válido.' });
  }
  if (!DATA_REGEX.test(data)) {
    return res.status(400).json({ erro: 'Informe uma data válida.' });
  }

  const [resultado] = await pool.query(
    'INSERT INTO despesas (profissional_id, descricao, valor, data) VALUES (?, ?, ?, ?)',
    [req.usuario.id, descricao, valor, data]
  );

  res.status(201).json({ id: resultado.insertId, descricao, valor, data });
});

router.delete('/:id', autenticar('profissional'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  await pool.query('DELETE FROM despesas WHERE id = ?', [id]);
  res.status(204).end();
});

module.exports = router;
