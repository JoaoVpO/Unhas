const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { emitirSessao, encerrarSessao, autenticar } = require('../middleware/auth');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^\d{4}$/;

router.post('/registrar', async (req, res) => {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }
  if (!SENHA_REGEX.test(senha)) {
    return res.status(400).json({ erro: 'A senha precisa ter exatamente 4 dígitos.' });
  }

  try {
    const [existentes] = await pool.query('SELECT id FROM profissionais WHERE email = ?', [email]);
    if (existentes.length) {
      return res.status(409).json({ erro: 'Já existe uma conta com este e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO profissionais (nome, email, senha_hash) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    emitirSessao(res, { id: resultado.insertId, papel: 'profissional' });
    return res.status(201).json({ id: resultado.insertId, nome, email });
  } catch (error) {
    console.error('Erro ao registrar profissional:', error);
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
      'SELECT id, nome, email, senha_hash FROM profissionais WHERE email = ?',
      [email]
    );
    const profissional = linhas[0];
    if (!profissional || !(await bcrypt.compare(senha, profissional.senha_hash))) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    emitirSessao(res, { id: profissional.id, papel: 'profissional' });
    return res.json({ id: profissional.id, nome: profissional.nome, email: profissional.email });
  } catch (error) {
    console.error('Erro ao autenticar profissional:', error);
    return res.status(500).json({ erro: 'Erro ao entrar. Tente novamente.' });
  }
});

router.post('/logout', (req, res) => {
  encerrarSessao(res);
  res.status(204).end();
});

router.get('/me', autenticar('profissional'), async (req, res) => {
  const [linhas] = await pool.query('SELECT id, nome, email FROM profissionais WHERE id = ?', [req.usuario.id]);
  const profissional = linhas[0];
  if (!profissional) {
    encerrarSessao(res);
    return res.status(401).json({ erro: 'Conta não encontrada.' });
  }
  return res.json(profissional);
});

module.exports = router;