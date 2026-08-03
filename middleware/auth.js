const jwt = require('jsonwebtoken');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function emitirSessao(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, COOKIE_OPTIONS);
}

function encerrarSessao(res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
}

function autenticar(papelEsperado) {
  return (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.papel !== papelEsperado) {
        return res.status(403).json({ erro: 'Acesso não permitido.' });
      }
      req.usuario = payload;
      next();
    } catch (error) {
      return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
    }
  };
}

function autenticarQualquer(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
}

module.exports = { emitirSessao, encerrarSessao, autenticar, autenticarQualquer };