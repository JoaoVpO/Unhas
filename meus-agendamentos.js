const listaMeusAgendamentos = document.getElementById('listaMeusAgendamentos');
const saudacaoCliente = document.getElementById('saudacaoCliente');
const btnSairCliente = document.getElementById('btnSairCliente');

btnSairCliente?.addEventListener('click', async () => {
  await apiFetch('/clientes/logout', { method: 'POST' }).catch(() => {});
  window.location.href = 'index.html';
});

async function carregarMeusAgendamentos() {
  const meus = await apiFetch('/agendamentos/minhas');

  if (!meus.length) {
    listaMeusAgendamentos.innerHTML = '<p>Nenhum agendamento confirmado ainda.</p>';
    return;
  }

  listaMeusAgendamentos.innerHTML = meus.map((item) => `
      <div class="day-item" data-id="${item.id}">
        <strong>${formatarDataBR(item.data)}</strong><br>
        Horário: ${escapeHtml(item.horario)}<br>
        Status: Confirmado
        <div class="links-row" style="margin-top:8px;">
          <button type="button" class="reset-btn btn-cancelar">Cancelar</button>
        </div>
      </div>`).join('');
}

listaMeusAgendamentos.addEventListener('click', async (event) => {
  const target = event.target;
  const itemEl = target.closest('.day-item');
  if (!itemEl) return;

  if (target.classList.contains('btn-cancelar')) {
    const confirmar = window.confirm('Deseja cancelar este agendamento?');
    if (!confirmar) return;

    try {
      await apiFetch(`/agendamentos/${itemEl.dataset.id}`, { method: 'DELETE' });
      await carregarMeusAgendamentos();
    } catch (error) {
      window.alert(error.message);
    }
  }
});

async function iniciar() {
  let cliente;
  try {
    cliente = await apiFetch('/clientes/me');
  } catch (error) {
    if (error.status === 401) {
      window.location.href = 'index.html';
    }
    return;
  }

  if (saudacaoCliente) {
    saudacaoCliente.textContent = `Olá, ${cliente.nome.split(' ')[0]}`;
  }

  await carregarMeusAgendamentos();
}

iniciar();
