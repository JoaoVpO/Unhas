const calendar = document.getElementById('calendar');
const timeSlots = document.getElementById('timeSlots');
const confirmacao = document.getElementById('confirmacao');
const confirmarAgendamento = document.getElementById('confirmarAgendamento');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const selectMesCliente = document.getElementById('selectMesCliente');
const selectAnoCliente = document.getElementById('selectAnoCliente');
const saudacaoCliente = document.getElementById('saudacaoCliente');
const btnSairCliente = document.getElementById('btnSairCliente');

let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();
let dataSelecionada = null;
let horarioSelecionado = null;
let disponibilidadeMes = {};

menuToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

btnSairCliente?.addEventListener('click', async () => {
  await apiFetch('/clientes/logout', { method: 'POST' }).catch(() => {});
  window.location.href = 'index.html';
});

function primeiraDataComSlots() {
  const data = Object.keys(disponibilidadeMes).sort().find((d) => disponibilidadeMes[d].length > 0);
  return data || null;
}

async function carregarDisponibilidade() {
  disponibilidadeMes = await apiFetch(`/agendamentos/disponibilidade?ano=${anoSelecionado}&mes=${mesSelecionado + 1}`);
}

function renderConfirmation() {
  if (!dataSelecionada || !horarioSelecionado) {
    confirmacao.innerHTML = '';
    return;
  }

  confirmacao.innerHTML = `
    <p>Horário escolhido: ${formatarDataBR(dataSelecionada)} às ${horarioSelecionado}. Clique em "Confirmar agendamento" para reservar.</p>
    <button type="button" class="reset-btn" id="resetReserva">Cancelar seleção</button>
  `;

  document.getElementById('resetReserva')?.addEventListener('click', () => {
    horarioSelecionado = null;
    renderTimeSlots(dataSelecionada);
    renderConfirmation();
  });
}

function renderCalendar() {
  renderizarCalendario(calendar, {
    ano: anoSelecionado,
    mes: mesSelecionado,
    temDestaque: (data) => (disponibilidadeMes[data]?.length ?? 0) > 0,
    estaAtivo: (data) => data === dataSelecionada,
    aoClicarDia: (data) => {
      dataSelecionada = data;
      horarioSelecionado = null;
      renderCalendar();
      renderTimeSlots(data);
      renderConfirmation();
    }
  });
}

function renderTimeSlots(data) {
  timeSlots.innerHTML = '';

  if (!data) {
    timeSlots.innerHTML = '<p class="empty">Selecione um dia disponível no calendário.</p>';
    return;
  }

  const slots = disponibilidadeMes[data] || [];

  if (!slots.length) {
    timeSlots.innerHTML = '<p class="empty">Nenhum horário disponível nesta data.</p>';
    return;
  }

  const title = document.createElement('h3');
  title.textContent = `Horários para ${formatarDataBR(data)}`;
  timeSlots.appendChild(title);

  slots.forEach((slot) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slot-btn';
    button.textContent = slot;

    if (dataSelecionada === data && horarioSelecionado === slot) {
      button.classList.add('selected');
    }

    button.addEventListener('click', () => {
      horarioSelecionado = slot;
      renderTimeSlots(data);
      renderConfirmation();
    });
    timeSlots.appendChild(button);
  });
}

confirmarAgendamento?.addEventListener('click', async () => {
  if (!dataSelecionada || !horarioSelecionado) {
    confirmacao.innerHTML = '<p>Escolha primeiro uma data e um horário.</p>';
    return;
  }

  try {
    await apiFetch('/agendamentos', { method: 'POST', body: { data: dataSelecionada, horario: horarioSelecionado } });
    const dataConfirmada = dataSelecionada;
    const horarioConfirmado = horarioSelecionado;
    horarioSelecionado = null;
    await carregarDisponibilidade();
    renderCalendar();
    renderTimeSlots(dataConfirmada);
    confirmacao.innerHTML = `<p>Agendamento confirmado para ${formatarDataBR(dataConfirmada)} às ${horarioConfirmado}.</p>`;
  } catch (error) {
    await carregarDisponibilidade();
    renderCalendar();
    renderTimeSlots(dataSelecionada);
    confirmacao.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
});

selectMesCliente?.addEventListener('change', async (event) => {
  mesSelecionado = Number(event.target.value);
  await carregarDisponibilidade();
  dataSelecionada = primeiraDataComSlots();
  horarioSelecionado = null;
  renderCalendar();
  renderTimeSlots(dataSelecionada);
  renderConfirmation();
});

selectAnoCliente?.addEventListener('change', async (event) => {
  anoSelecionado = Number(event.target.value);
  await carregarDisponibilidade();
  dataSelecionada = primeiraDataComSlots();
  horarioSelecionado = null;
  renderCalendar();
  renderTimeSlots(dataSelecionada);
  renderConfirmation();
});

async function iniciar() {
  let cliente;
  try {
    cliente = await apiFetch('/clientes/me');
  } catch (error) {
    window.location.href = 'index.html';
    return;
  }

  if (saudacaoCliente) {
    saudacaoCliente.textContent = `Olá, ${cliente.nome.split(' ')[0]}`;
  }

  popularSeletoresMesAno(selectMesCliente, selectAnoCliente, mesSelecionado, anoSelecionado);
  await carregarDisponibilidade();
  dataSelecionada = primeiraDataComSlots();
  renderCalendar();
  renderTimeSlots(dataSelecionada);
  renderConfirmation();
}

iniciar();
