const dadosConta = document.getElementById('dadosConta');
const saudacaoCliente = document.getElementById('saudacaoCliente');
const btnSairCliente = document.getElementById('btnSairCliente');

btnSairCliente?.addEventListener('click', async () => {
  await apiFetch('/clientes/logout', { method: 'POST' }).catch(() => {});
  window.location.href = 'index.html';
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

  dadosConta.innerHTML = `
    <p><strong>Nome:</strong> ${escapeHtml(cliente.nome)}</p>
    <p><strong>Telefone:</strong> ${escapeHtml(cliente.telefone)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(cliente.email)}</p>
    <p>Em breve você poderá editar esses dados por aqui.</p>
  `;
}

iniciar();
