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
      <div class="day-item">
        <strong>${dataFormatada}</strong><br>
        Horário: ${item.horario}<br>
        Status: Confirmado
      </div>`;
  }).join('');
}

carregarMeusAgendamentos();
