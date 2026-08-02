const horariosDisponiveisPadrao = ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];

function getClienteAtual() {
  try {
    return JSON.parse(localStorage.getItem('clienteGlowBeauty') || 'null');
  } catch (error) {
    return null;
  }
}

function getHorariosDisponiveis(date) {
  const agendamentos = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
  const horariosOcupados = agendamentos
    .filter((item) => item.data === date)
    .map((item) => item.horario);

  return horariosDisponiveisPadrao.filter((horario) => !horariosOcupados.includes(horario));
}

function getPrimeiraDataComDisponibilidade(ano, mes) {
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const data = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    if (getHorariosDisponiveis(data).length) {
      return data;
    }
  }

  return null;
}

const calendar = document.getElementById('calendar');
const timeSlots = document.getElementById('timeSlots');
const confirmacao = document.getElementById('confirmacao');
const confirmarAgendamento = document.getElementById('confirmarAgendamento');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const selectMesCliente = document.getElementById('selectMesCliente');
const selectAnoCliente = document.getElementById('selectAnoCliente');
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ANO_INICIAL = 2026;
const ANO_FINAL = 2100;
let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();
let dataSelecionada = null;

menuToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

function saveReserva(reserva) {
  localStorage.setItem('reservaGlowBeauty', JSON.stringify(reserva));

  const clienteAtual = getClienteAtual();
  const agendamentos = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
  const novoAgendamento = {
    ...reserva,
    cliente: clienteAtual?.nome || 'Cliente',
    telefone: clienteAtual?.telefone || ''
  };

  const jaExiste = agendamentos.some((item) => item.data === reserva.data && item.horario === reserva.horario);
  if (!jaExiste) {
    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentosGlowBeauty', JSON.stringify(agendamentos));
  }
}

function getReserva() {
  const reservaSalva = localStorage.getItem('reservaGlowBeauty');
  return reservaSalva ? JSON.parse(reservaSalva) : null;
}

function popularSeletores() {
  selectMesCliente.innerHTML = meses.map((mes, index) => `<option value="${index}" ${index === mesSelecionado ? 'selected' : ''}>${mes}</option>`).join('');

  const anos = Array.from({ length: ANO_FINAL - ANO_INICIAL + 1 }, (_, index) => ANO_INICIAL + index);
  selectAnoCliente.innerHTML = anos.map((ano) => `<option value="${ano}" ${ano === anoSelecionado ? 'selected' : ''}>${ano}</option>`).join('');
}

function getDateParaMesAtual() {
  const dataDoMes = `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}`;
  const dataSelecionadaNoMes = dataSelecionada && dataSelecionada.startsWith(dataDoMes) ? dataSelecionada : null;

  if (dataSelecionadaNoMes) {
    return dataSelecionadaNoMes;
  }

  return getPrimeiraDataComDisponibilidade(anoSelecionado, mesSelecionado) || null;
}

function renderConfirmation() {
  const reserva = getReserva();
  if (!reserva) {
    confirmacao.innerHTML = '';
    return;
  }

  const dataFormatada = new Date(reserva.data + 'T00:00:00').toLocaleDateString('pt-BR');
  confirmacao.innerHTML = `
    <p>Reserva escolhida para ${dataFormatada} às ${reserva.horario}.</p>
    <button class="reset-btn" id="resetReserva">Cancelar seleção</button>
  `;

  document.getElementById('resetReserva')?.addEventListener('click', () => {
    localStorage.removeItem('reservaGlowBeauty');
    dataSelecionada = null;
    renderCalendar();
    renderTimeSlots(getDateParaMesAtual());
    renderConfirmation();
  });
}

function renderCalendar() {
  const firstDay = new Date(anoSelecionado, mesSelecionado, 1);
  const lastDay = new Date(anoSelecionado, mesSelecionado + 1, 0);
  const totalDays = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const reserva = getReserva();

  calendar.innerHTML = '';

  const cabecalho = document.createElement('div');
  cabecalho.className = 'calendar-header';
  cabecalho.textContent = `${meses[mesSelecionado]} ${anoSelecionado}`;
  calendar.appendChild(cabecalho);

  diasSemana.forEach((day) => {
    const span = document.createElement('div');
    span.className = 'weekday';
    span.textContent = day;
    calendar.appendChild(span);
  });

  for (let i = 0; i < startWeekday; i += 1) {
    const empty = document.createElement('div');
    empty.className = 'day-btn empty-day';
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${anoSelecionado}-${String(mesSelecionado + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const button = document.createElement('button');
    button.className = 'day-btn';
    button.textContent = day;
    button.title = new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    if (getHorariosDisponiveis(date).length) {
      button.classList.add('has-slots');
    }

    if ((reserva && reserva.data === date) || dataSelecionada === date) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      dataSelecionada = date;
      document.querySelectorAll('#calendar .day-btn').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      renderTimeSlots(date);
    });

    calendar.appendChild(button);
  }
}

confirmarAgendamento?.addEventListener('click', () => {
  const reserva = getReserva();
  if (!reserva) {
    confirmacao.innerHTML = '<p>Escolha primeiro uma data e um horário.</p>';
    return;
  }

  const slotsAtuais = getHorariosDisponiveis(reserva.data);
  if (!slotsAtuais.includes(reserva.horario)) {
    confirmacao.innerHTML = '<p>Este horário já não está mais disponível.</p>';
    return;
  }

  const dataFormatada = new Date(reserva.data + 'T00:00:00').toLocaleDateString('pt-BR');
  confirmacao.innerHTML = `<p>Agendamento confirmado para ${dataFormatada} às ${reserva.horario}.</p>`;
});

function renderTimeSlots(date) {
  timeSlots.innerHTML = '';

  if (!date) {
    timeSlots.innerHTML = '<p class="empty">Selecione um dia disponível no calendário.</p>';
    return;
  }

  const slots = getHorariosDisponiveis(date);

  if (!slots.length) {
    timeSlots.innerHTML = '<p class="empty">Nenhum horário disponível nesta data.</p>';
    return;
  }

  const title = document.createElement('h3');
  title.textContent = `Horários para ${new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}`;
  timeSlots.appendChild(title);

  const reserva = getReserva();

  slots.forEach((slot) => {
    const button = document.createElement('button');
    button.className = 'slot-btn';
    button.textContent = slot;

    if (reserva && reserva.data === date && reserva.horario === slot) {
      button.classList.add('selected');
    }

    button.addEventListener('click', () => {
      const slotsAtuais = getHorariosDisponiveis(date);
      if (!slotsAtuais.includes(slot)) {
        confirmacao.innerHTML = '<p>Este horário já foi reservado. Escolha outro.</p>';
        return;
      }

      const novaReserva = { data: date, horario: slot };
      saveReserva(novaReserva);
      renderCalendar();
      renderTimeSlots(date);
      renderConfirmation();
    });
    timeSlots.appendChild(button);
  });
}

selectMesCliente.addEventListener('change', (event) => {
  mesSelecionado = Number(event.target.value);
  renderCalendar();
  renderTimeSlots(getDateParaMesAtual());
});

selectAnoCliente.addEventListener('change', (event) => {
  anoSelecionado = Number(event.target.value);
  renderCalendar();
  renderTimeSlots(getDateParaMesAtual());
});

const clienteAtual = getClienteAtual();
if (!clienteAtual?.nome) {
  window.location.href = 'index.html';
} else {
  popularSeletores();
  const reservaInicial = getReserva();
  if (reservaInicial?.data) {
    const [anoReserva, mesReserva] = reservaInicial.data.split('-');
    mesSelecionado = Number(mesReserva) - 1;
    anoSelecionado = Number(anoReserva);
    dataSelecionada = reservaInicial.data;
    popularSeletores();
  }

  renderCalendar();
  renderTimeSlots(getDateParaMesAtual());
  renderConfirmation();
}
