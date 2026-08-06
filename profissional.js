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
const areaLoginProfissional = document.getElementById('areaLoginProfissional');
const loginProfissionalCard = document.getElementById('loginProfissionalCard');
const registroProfissionalCard = document.getElementById('registroProfissionalCard');
const btnIrRegistroProfissional = document.getElementById('btnIrRegistroProfissional');
const btnVoltarLoginProfissional = document.getElementById('btnVoltarLoginProfissional');
const btnCancelarSelecionados = document.getElementById('btnCancelarSelecionados');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();
let agendamentosMes = {};

menuToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

function mostrarAreaProfissional() {
  areaProfissional.classList.remove('hidden');
  areaLoginProfissional.classList.add('hidden');
  carregarAgendamentos();
}

function mostrarLoginProfissional() {
  areaProfissional.classList.add('hidden');
  areaLoginProfissional.classList.remove('hidden');
  loginProfissionalCard.classList.remove('hidden');
  registroProfissionalCard.classList.add('hidden');
}

function mostrarRegistroProfissional() {
  areaProfissional.classList.add('hidden');
  areaLoginProfissional.classList.remove('hidden');
  loginProfissionalCard.classList.add('hidden');
  registroProfissionalCard.classList.remove('hidden');
}

async function autenticarProfissional(event) {
  event.preventDefault();

  const email = document.getElementById('emailProfissional').value.trim();
  const senha = document.getElementById('senhaProfissional').value;

  if (!email) {
    mensagemProfissional.textContent = 'Informe seu e-mail para entrar.';
    return;
  }

  if (!/^\d{4}$/.test(senha)) {
    mensagemProfissional.textContent = 'A senha precisa ter exatamente 4 dígitos.';
    return;
  }

  try {
    const profissional = await apiFetch('/profissionais/login', { method: 'POST', body: { email, senha } });
    mensagemProfissional.textContent = `Bem-vindo, ${profissional.nome}!`;
    mostrarAreaProfissional();
  } catch (error) {
    mensagemProfissional.textContent = error.message;
  }
}

async function cadastrarProfissional(event) {
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

  try {
    const profissional = await apiFetch('/profissionais/registrar', { method: 'POST', body: { nome, email, senha } });
    mensagemRegistroProfissional.textContent = `Conta criada com sucesso para ${profissional.nome}!`;
    mostrarAreaProfissional();
  } catch (error) {
    mensagemRegistroProfissional.textContent = error.message;
  }
}

function mostrarCalendario() {
  calendarioProfissional.classList.remove('hidden');
  listaDia.classList.add('hidden');
  voltarCalendario.hidden = true;
  tituloDia.textContent = 'Calendário de agendamentos';
  listaDia.innerHTML = '<p>Selecione um dia no calendário.</p>';
}

function mostrarAgendamentos(data, agendamentosDoDia) {
  calendarioProfissional.classList.add('hidden');
  listaDia.classList.remove('hidden');
  voltarCalendario.hidden = false;

  const lista = agendamentosDoDia.length
    ? agendamentosDoDia.map((item) => `
        <label class="day-item">
          <input type="checkbox" class="bolinha-selecao" value="${item.id}" />
          <span>
            <strong>${escapeHtml(item.cliente.nome || 'Cliente')}</strong><br>
            Horário: ${escapeHtml(item.horario)}<br>
            Serviço: ${escapeHtml(item.servico || 'Não informado')}<br>
            Telefone: ${escapeHtml(item.cliente.telefone || 'Não informado')}
          </span>
        </label>`).join('')
    : '<p>Nenhum agendamento para este dia.</p>';

  listaDia.innerHTML = lista;
  tituloDia.textContent = `Agendamentos de ${formatarDataBR(data)}`;
}

btnCancelarSelecionados?.addEventListener('click', async () => {
  const ids = Array.from(document.querySelectorAll('.bolinha-selecao:checked')).map((chk) => chk.value);

  if (!ids.length) {
    window.alert('Selecione ao menos um agendamento para cancelar.');
    return;
  }

  const confirmar = window.confirm(`Cancelar ${ids.length} agendamento(s) selecionado(s)?`);
  if (!confirmar) return;

  try {
    await Promise.all(ids.map((id) => apiFetch(`/agendamentos/${id}`, { method: 'DELETE' })));
    await carregarAgendamentos();
  } catch (error) {
    window.alert(error.message);
  }
});

function carregarCalendario() {
  calendarioProfissional.innerHTML = '';
  mostrarCalendario();

  renderizarCalendario(calendarioProfissional, {
    ano: anoSelecionado,
    mes: mesSelecionado,
    temDestaque: (data) => (agendamentosMes[data]?.length ?? 0) > 0,
    aoClicarDia: (data, botao) => {
      document.querySelectorAll('#calendarioProfissional .day-btn').forEach((btn) => btn.classList.remove('active'));
      botao.classList.add('active');
      mostrarAgendamentos(data, agendamentosMes[data] || []);
    }
  });
}

async function carregarAgendamentos() {
  const lista = await apiFetch(`/agendamentos?ano=${anoSelecionado}&mes=${mesSelecionado + 1}`);
  agendamentosMes = {};
  lista.forEach((item) => {
    if (!agendamentosMes[item.data]) agendamentosMes[item.data] = [];
    agendamentosMes[item.data].push(item);
  });
  carregarCalendario();
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

formLoginProfissional.addEventListener('submit', autenticarProfissional);
formCadastroProfissional.addEventListener('submit', cadastrarProfissional);
btnIrRegistroProfissional.addEventListener('click', mostrarRegistroProfissional);
btnVoltarLoginProfissional.addEventListener('click', mostrarLoginProfissional);

async function iniciar() {
  popularSeletoresMesAno(selectMes, selectAno, mesSelecionado, anoSelecionado);

  try {
    await apiFetch('/profissionais/me');
    mostrarAreaProfissional();
    return;
  } catch (error) {
    if (error.status === 401) {
      mostrarLoginProfissional();
      return;
    }
  }

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    await apiFetch('/profissionais/me');
    mostrarAreaProfissional();
  } catch (error) {
    mostrarLoginProfissional();
  }
}

iniciar();
