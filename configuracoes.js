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

function carregarContatos() {
  const agendamentos = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
  const clientes = agendamentos.map((item) => item.cliente || 'Cliente');
  const telefones = agendamentos.map((item) => item.telefone || 'Não informado');

  if (!agendamentos.length) {
    listaContatos.innerHTML = '<li>Nenhum contato registrado ainda.</li>';
    return;
  }

  listaContatos.innerHTML = agendamentos
    .map((item, index) => `<li>${clientes[index]} — ${telefones[index]}</li>`)
    .join('');
}

botaoSalvar?.addEventListener('click', () => {
  localStorage.setItem('mensagemLembreteGlowBeauty', campoMensagem.value);
  alert('Mensagem salva com sucesso!');
});

botaoLimparHistorico?.addEventListener('click', () => {
  const chaves = Object.keys(localStorage).filter((chave) => chave.includes('GlowBeauty') || chave.includes('cliente') || chave.includes('agendamento') || chave.includes('mensagem'));
  chaves.forEach((chave) => localStorage.removeItem(chave));
  carregarMensagem();
  carregarContatos();
  alert('Histórico limpo com sucesso!');
});

carregarMensagem();
carregarContatos();
