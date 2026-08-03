const formLogin = document.getElementById('formLogin');
const formCadastroCliente = document.getElementById('formCadastroCliente');
const mensagem = document.getElementById('mensagem');

function mostrarMensagem(texto) {
  if (mensagem) {
    mensagem.textContent = texto;
  }
}

formCadastroCliente?.addEventListener('submit', async (event) => {
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

  try {
    await apiFetch('/clientes/registrar', { method: 'POST', body: { nome, telefone, email, senha } });
    localStorage.setItem('mensagemCliente', `Conta criada com sucesso para ${nome}! Agora você pode entrar.`);
    window.location.href = 'index.html';
  } catch (error) {
    mostrarMensagem(error.message);
  }
});

formLogin?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('emailLogin').value.trim();
  const senha = document.getElementById('senhaLogin').value;

  if (!email || !senha) {
    mostrarMensagem('Preencha e-mail e senha para entrar.');
    return;
  }

  try {
    const cliente = await apiFetch('/clientes/login', { method: 'POST', body: { email, senha } });
    mostrarMensagem(`Olá, ${cliente.nome}! Redirecionando para a página de agendamento...`);
    window.setTimeout(() => {
      window.location.href = 'agenda.html';
    }, 400);
  } catch (error) {
    mostrarMensagem(error.message);
  }
});

if (mensagem && window.location.pathname.includes('index.html')) {
  const mensagemPersistida = localStorage.getItem('mensagemCliente');
  if (mensagemPersistida) {
    mostrarMensagem(mensagemPersistida);
    localStorage.removeItem('mensagemCliente');
  }
}