const calendarioProfissional = document.getElementById('calendarioProfissional');
const listaDia = document.getElementById('listaDia');
const tituloDia = document.getElementById('tituloDia');
const voltarCalendario = document.getElementById('voltarCalendario');
const selectMes = document.getElementById('selectMes');
const selectAno = document.getElementById('selectAno');
const formLoginProfissional = document.getElementById('formLoginProfissional');
const formCadastroProfissional = document.getElementById('formCadastroProfissional');
const mensagemProfissional = document.getElementById('mensagemProfissional');
const mensagemRegistroProfissional = document.getElementById('mensagemRegistroProfissional');
const areaProfissional = document.getElementById('areaProfissional');
const loginProfissionalCard = document.getElementById('loginProfissionalCard');
const registroProfissionalCard = document.getElementById('registroProfissionalCard');
const btnIrRegistroProfissional = document.getElementById('btnIrRegistroProfissional');
const btnVoltarLoginProfissional = document.getElementById('btnVoltarLoginProfissional');
const voltarPaginaProfissional = document.getElementById('voltarPaginaProfissional');
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CHAVE_SESSAO_PROFISSIONAL = 'profissionalSessaoGlowBeauty';
let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();
const ANO_INICIAL = 2026;
const ANO_FINAL = 2100;

function mostrarAreaProfissional() {
  areaProfissional.classList.remove('hidden');
  loginProfissionalCard.classList.add('hidden');
  registroProfissionalCard.classList.add('hidden');
  localStorage.setItem(CHAVE_SESSAO_PROFISSIONAL, 'true');
}

function mostrarLoginProfissional() {
  areaProfissional.classList.add('hidden');
  loginProfissionalCard.classList.remove('hidden');
  registroProfissionalCard.classList.add('hidden');
  localStorage.removeItem(CHAVE_SESSAO_PROFISSIONAL);
}

function mostrarRegistroProfissional() {
  loginProfissionalCard.classList.add('hidden');
  registroProfissionalCard.classList.remove('hidden');
  areaProfissional.classList.add('hidden');
}

function autenticarProfissional(event) {
  event.preventDefault();

  const nome = document.getElementById('nomeProfissional').value.trim();
  const senha = document.getElementById('senhaProfissional').value;

  if (!nome) {
    mensagemProfissional.textContent = 'Informe seu nome para entrar.';
    return;
  }

  if (!/^\d{4}$/.test(senha)) {
    mensagemProfissional.textContent = 'A senha precisa ter exatamente 4 dígitos.';
    return;
  }

  const credenciaisSalvas = JSON.parse(localStorage.getItem('profissionalGlowBeauty') || 'null');
  if (!credenciaisSalvas || credenciaisSalvas.nome !== nome || credenciaisSalvas.senha !== senha) {
    mensagemProfissional.textContent = 'Nenhum profissional encontrado com esses dados.';
    return;
  }

  mensagemProfissional.textContent = `Bem-vindo, ${nome}!`;
  mostrarAreaProfissional();
  carregarAgendamentos();
}

function cadastrarProfissional(event) {
  event.preventDefault();

  const nome = document.getElementById('novoNomeProfissional').value.trim();
  const email = document.getElementById('novoEmailProfissional').value.trim();
  const senha = document.getElementById('novaSenhaProfissional').value;

  if (!nome || !email || !senha) {
    mensagemRegistroProfissional.textContent = 'Preencha nome, e-mail e senha para criar sua conta.';
    return;
  }

  if (!/^\d{4}$/.test(senha)) {
    mensagemRegistroProfissional.textContent = 'A senha precisa ter exatamente 4 dígitos.';
    return;
  }

  const conta = { nome, email, senha };
  localStorage.setItem('profissionalGlowBeauty', JSON.stringify(conta));
  mensagemRegistroProfissional.textContent = `Conta criada com sucesso para ${nome}!`;
  document.getElementById('nomeProfissional').value = nome;
  document.getElementById('senhaProfissional').value = senha;
  mostrarAreaProfissional();
  carregarAgendamentos();
}

function mostrarCalendario() {
  calendarioProfissional.classList.remove('hidden');
  listaDia.classList.add('hidden');
  voltarCalendario.hidden = true;
  tituloDia.textContent = 'Calendário de agendamentos';
  listaDia.innerHTML = '<p>Selecione um dia no calendário.</p>';
}

function voltarParaVisualizacao() {
  if (!listaDia.classList.contains('hidden')) {
    mostrarCalendario();
    return;
  }

  const confirmarSaida = window.confirm('Deseja voltar para a página de login?');
  if (confirmarSaida) {
    mostrarLoginProfissional();
  }
}

function mostrarAgendamentos(data, agendamentosDoDia) {
  calendarioProfissional.classList.add('hidden');
  listaDia.classList.remove('hidden');
  voltarCalendario.hidden = false;

  const lista = agendamentosDoDia.length
    ? agendamentosDoDia.map((item) => `
        <div class="day-item" data-data="${item.data}" data-horario="${item.horario}" data-cliente="${item.cliente}">
          <strong>${item.cliente || 'Cliente'}</strong><br>
          Horário: ${item.horario}<br>
          Telefone: ${item.telefone || 'Não informado'}
          <div class="links-row" style="margin-top:8px;">
            <button class="slot-btn btn-selecionar">Selecionar</button>
            <button class="reset-btn btn-cancelar">Cancelar</button>
          </div>
        </div>`).join('')
    : '<p>Nenhum agendamento para este dia.</p>';

  listaDia.innerHTML = lista;
  tituloDia.textContent = `Agendamentos de ${new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')}`;
}

// Delegation: seleção e cancelamento de agendamentos (profissional)
listaDia.addEventListener('click', (event) => {
  const target = event.target;
  const itemEl = target.closest('.day-item');
  if (!itemEl) return;

  const data = itemEl.dataset.data;
  const horario = itemEl.dataset.horario;
  const cliente = itemEl.dataset.cliente;

  if (target.classList.contains('btn-selecionar')) {
    document.querySelectorAll('#listaDia .day-item').forEach((el) => el.classList.remove('selected'));
    itemEl.classList.add('selected');
    // opcional: salvar seleção para navegação/ações
    localStorage.setItem('reservaGlowBeauty', JSON.stringify({ data, horario }));
  }

  if (target.classList.contains('btn-cancelar')) {
    const confirmar = window.confirm('Cancelar este agendamento?');
    if (!confirmar) return;
    const agendamentos = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
    const filtrados = agendamentos.filter((a) => !(a.data === data && a.horario === horario && a.cliente === cliente));
    localStorage.setItem('agendamentosGlowBeauty', JSON.stringify(filtrados));
    mostrarAgendamentos(data, filtrados.filter((i) => i.data === data));
  }
});

function popularSeletores() {
  selectMes.innerHTML = meses.map((mes, index) => `<option value="${index}" ${index === mesSelecionado ? 'selected' : ''}>${mes}</option>`).join('');

  const anos = Array.from({ length: ANO_FINAL - ANO_INICIAL + 1 }, (_, index) => ANO_INICIAL + index);
  selectAno.innerHTML = anos.map((ano) => `<option value="${ano}" ${ano === anoSelecionado ? 'selected' : ''}>${ano}</option>`).join('');
}

function carregarAgendamentos() {
  const reservas = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
  const primeiroDia = new Date(anoSelecionado, mesSelecionado, 1);
  const ultimoDia = new Date(anoSelecionado, mesSelecionado + 1, 0);
  const totalDias = ultimoDia.getDate();
  const inicio = primeiroDia.getDay();

  calendarioProfissional.innerHTML = '';
  mostrarCalendario();

  const cabecalho = document.createElement('div');
  cabecalho.className = 'calendar-header';
  cabecalho.textContent = `${meses[mesSelecionado]} ${anoSelecionado}`;
  calendarioProfissional.appendChild(cabecalho);

  diasSemana.forEach((dia) => {
    const span = document.createElement('div');
    span.className = 'weekday';
    span.textContent = dia;
    calendarioProfissional.appendChild(span);
  });

  for (let i = 0; i < inicio; i += 1) {
    const vazio = document.createElement('div');
    vazio.className = 'day-btn empty-day';
    calendarioProfissional.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const data = `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const botao = document.createElement('button');
    botao.className = 'day-btn';
    botao.textContent = dia;

    const agendamentosDoDia = reservas.filter((item) => item.data === data);
    if (agendamentosDoDia.length) {
      botao.classList.add('has-slots');
    }

    botao.addEventListener('click', () => {
      document.querySelectorAll('#calendarioProfissional .day-btn').forEach((btn) => btn.classList.remove('active'));
      botao.classList.add('active');
      mostrarAgendamentos(data, agendamentosDoDia);
    });

    calendarioProfissional.appendChild(botao);
  }
}

selectMes.addEventListener('change', (event) => {
  mesSelecionado = Number(event.target.value);
  carregarAgendamentos();
});

selectAno.addEventListener('change', (event) => {
  anoSelecionado = Number(event.target.value);
  carregarAgendamentos();
});

voltarCalendario.addEventListener('click', mostrarCalendario);
voltarPaginaProfissional?.addEventListener('click', (event) => {
  event.preventDefault();
  voltarParaVisualizacao();
});
formLoginProfissional.addEventListener('submit', autenticarProfissional);
formCadastroProfissional.addEventListener('submit', cadastrarProfissional);
btnIrRegistroProfissional.addEventListener('click', mostrarRegistroProfissional);
btnVoltarLoginProfissional.addEventListener('click', mostrarLoginProfissional);
popularSeletores();

const credenciaisSalvas = JSON.parse(localStorage.getItem('profissionalGlowBeauty') || 'null');
const sessaoAtiva = localStorage.getItem(CHAVE_SESSAO_PROFISSIONAL);
if (credenciaisSalvas && sessaoAtiva) {
  mostrarAreaProfissional();
  carregarAgendamentos();
} else {
  mostrarLoginProfissional();
}
