const listaMeusAgendamentos = document.getElementById('listaMeusAgendamentos');

function carregarMeusAgendamentos() {
  const reservas = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
  const cliente = JSON.parse(localStorage.getItem('clienteGlowBeauty') || 'null');

  const meus = reservas.filter((item) => item.cliente === (cliente?.nome || 'Cliente'));

  if (!meus.length) {
    listaMeusAgendamentos.innerHTML = '<p>Nenhum agendamento confirmado ainda.</p>';
    return;
  }

  listaMeusAgendamentos.innerHTML = meus.map((item) => {
    const dataFormatada = new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR');
    return `
      <div class="day-item" data-data="${item.data}" data-horario="${item.horario}" data-cliente="${item.cliente}">
        <strong>${dataFormatada}</strong><br>
        Horário: ${item.horario}<br>
        Status: Confirmado
        <div class="links-row" style="margin-top:8px;">
          <button class="slot-btn btn-selecionar">Selecionar</button>
          <button class="reset-btn btn-cancelar">Cancelar</button>
        </div>
      </div>`;
  }).join('');
}

carregarMeusAgendamentos();

// Delegation: tratar selecionar e cancelar
listaMeusAgendamentos.addEventListener('click', (event) => {
  const target = event.target;
  const itemEl = target.closest('.day-item');
  if (!itemEl) return;

  const data = itemEl.dataset.data;
  const horario = itemEl.dataset.horario;
  const cliente = itemEl.dataset.cliente;

  if (target.classList.contains('btn-selecionar')) {
    // marcar seleção visual e salvar como reserva atual
    document.querySelectorAll('#listaMeusAgendamentos .day-item').forEach((el) => el.classList.remove('selected'));
    itemEl.classList.add('selected');
    localStorage.setItem('reservaGlowBeauty', JSON.stringify({ data, horario }));
    mostrarMensagem(`Agendamento selecionado: ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${horario}`);
  }

  if (target.classList.contains('btn-cancelar')) {
    const confirmar = window.confirm('Deseja cancelar este agendamento?');
    if (!confirmar) return;

    const agendamentos = JSON.parse(localStorage.getItem('agendamentosGlowBeauty') || '[]');
    const filtrados = agendamentos.filter((a) => !(a.data === data && a.horario === horario && a.cliente === cliente));
    localStorage.setItem('agendamentosGlowBeauty', JSON.stringify(filtrados));
    if (JSON.parse(localStorage.getItem('reservaGlowBeauty') || 'null')?.data === data && JSON.parse(localStorage.getItem('reservaGlowBeauty') || 'null')?.horario === horario) {
      localStorage.removeItem('reservaGlowBeauty');
    }
    carregarMeusAgendamentos();
    mostrarMensagem('Agendamento cancelado com sucesso.');
  }
});
