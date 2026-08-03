const campoMensagem = document.getElementById('textoLembrete');
const botaoSalvar = document.getElementById('salvarLembrete');
const botaoLimparHistorico = document.getElementById('limparHistorico');
const listaContatos = document.getElementById('listaContatos');

function carregarMensagem() {
  const mensagemSalva = localStorage.getItem('mensagemLembreteGlowBeauty');
  if (mensagemSalva) {
    campoMensagem.value = mensagemSalva;
  }
}

async function carregarContatos() {
  const agendamentos = await apiFetch('/agendamentos');

  if (!agendamentos.length) {
    listaContatos.innerHTML = '<li>Nenhum contato registrado ainda.</li>';
    return;
  }

  const contatosUnicos = new Map();
  agendamentos.forEach((item) => {
    const chave = `${item.cliente.nome}|${item.cliente.telefone}`;
    contatosUnicos.set(chave, item.cliente);
  });

  listaContatos.innerHTML = Array.from(contatosUnicos.values())
    .map((cliente) => `<li>${escapeHtml(cliente.nome || 'Cliente')} — ${escapeHtml(cliente.telefone || 'Não informado')}</li>`)
    .join('');
}

botaoSalvar?.addEventListener('click', () => {
  localStorage.setItem('mensagemLembreteGlowBeauty', campoMensagem.value);
  window.alert('Mensagem salva com sucesso!');
});

botaoLimparHistorico?.addEventListener('click', () => {
  const confirmar = window.confirm('Isso vai limpar apenas os dados salvos neste navegador (mensagem de lembrete). Os agendamentos continuam salvos no sistema. Continuar?');
  if (!confirmar) return;

  localStorage.removeItem('mensagemLembreteGlowBeauty');
  campoMensagem.value = '';
  window.alert('Dados locais limpos com sucesso!');
});

async function iniciar() {
  try {
    await apiFetch('/profissionais/me');
  } catch (error) {
    window.location.href = 'profissional.html';
    return;
  }

  carregarMensagem();
  await carregarContatos();
}

iniciar();