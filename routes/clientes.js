const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { emitirSessao, encerrarSessao, autenticar } = require('../middleware/auth');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/registrar', async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const telefone = String(req.body.telefone || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  if (!nome || !telefone || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, telefone, e-mail e senha.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
  }

  try {
    const [existentes] = await pool.query('SELECT id FROM clientes WHERE email = ?', [email]);
    if (existentes.length) {
      return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO clientes (nome, telefone, email, senha_hash) VALUES (?, ?, ?, ?)',
      [nome, telefone, email, senhaHash]
    );

    emitirSessao(res, { id: resultado.insertId, papel: 'cliente' });
    return res.status(201).json({ id: resultado.insertId, nome, telefone, email });
  } catch (error) {
    console.error('Erro ao registrar cliente:', error);
    return res.status(500).json({ erro: 'Erro ao criar conta. Tente novamente.' });
  }
});

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  try {
    const [linhas] = await pool.query(
      'SELECT id, nome, telefone, email, senha_hash FROM clientes WHERE email = ?',
      [email]
    );
    const cliente = linhas[0];
    if (!cliente || !(await bcrypt.compare(senha, cliente.senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    emitirSessao(res, { id: cliente.id, papel: 'cliente' });
    return res.json({ id: cliente.id, nome: cliente.nome, telefone: cliente.telefone, email: cliente.email });
  } catch (error) {
    console.error('Erro ao autenticar cliente:', error);
    return res.status(500).json({ erro: 'Erro ao entrar. Tente novamente.' });
  }
});

router.post('/logout', (req, res) => {
  encerrarSessao(res);
  res.status(204).end();
});

router.get('/me', autenticar('cliente'), async (req, res) => {
  const [linhas] = await pool.query('SELECT id, nome, telefone, email FROM clientes WHERE id = ?', [req.usuario.id]);
  const cliente = linhas[0];
  if (!cliente) {
    encerrarSessao(res);
    return res.status(401).json({ erro: 'Conta não encontrada.' });
  }
  return res.json(cliente);
});

module.exports = router;