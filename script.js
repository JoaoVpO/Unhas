const formLogin = document.getElementById('formLogin');
const formCadastroCliente = document.getElementById('formCadastroCliente');
const mensagem = document.getElementById('mensagem');

function getClienteAtual() {
  try {
    return JSON.parse(localStorage.getItem('clienteGlowBeauty') || 'null');
  } catch (error) {
    return null;
  }
}

function limparReservaAtual() {
  localStorage.removeItem('reservaGlowBeauty');
}

function mostrarMensagem(texto) {
  if (mensagem) {
    mensagem.textContent = texto;
  }
}

formCadastroCliente?.addEventListener('submit', (event) => {
  event.preventDefault();

  const nome = document.getElementById('novoNome').value.trim();
  const telefone = document.getElementById('novoTelefone').value.trim();
  const email = document.getElementById('novoEmail').value.trim();
  const senha = document.getElementById('novaSenha').value;

  if (!nome || !telefone || !email || !senha) {
    mostrarMensagem('Preencha nome, telefone, e-mail e senha para criar sua conta.');
    return;
  }

  if (senha.length < 6) {
    mostrarMensagem('A senha precisa ter pelo menos 6 caracteres.');
    return;
  }

  const conta = { nome, telefone, email, senha };
  localStorage.setItem('clienteGlowBeauty', JSON.stringify(conta));
  limparReservaAtual();
  localStorage.setItem('mensagemCliente', `Conta criada com sucesso para ${nome}! Agora você pode entrar.`);
  window.location.href = 'index.html';
});

formLogin?.addEventListener('submit', (event) => {
  event.preventDefault();

  const nome = document.getElementById('nomeLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value;

  if (!nome || !senha) {
    mostrarMensagem('Preencha nome e senha para entrar.');
    return;
  }

  const contaSalva = getClienteAtual();

  if (!contaSalva) {
    mostrarMensagem('Nenhuma conta encontrada. Crie uma conta primeiro.');
    return;
  }

  if (contaSalva.nome !== nome || contaSalva.senha !== senha) {
    mostrarMensagem('Nome ou senha incorretos.');
    return;
  }

  localStorage.setItem('clienteGlowBeauty', JSON.stringify(contaSalva));
  limparReservaAtual();
  mostrarMensagem(`Olá, ${contaSalva.nome}! Redirecionando para a página de agendamento...`);
  window.setTimeout(() => {
    window.location.href = 'agenda.html';
  }, 400);
});

if (mensagem && window.location.pathname.includes('index.html')) {
  const mensagemPersistida = localStorage.getItem('mensagemCliente');
  if (mensagemPersistida) {
    mostrarMensagem(mensagemPersistida);
    localStorage.removeItem('mensagemCliente');
  }
}
