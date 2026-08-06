const selectMesRelatorio = document.getElementById('selectMesRelatorio');
const selectAnoRelatorio = document.getElementById('selectAnoRelatorio');
const valorReceita = document.getElementById('valorReceita');
const valorAtendimentos = document.getElementById('valorAtendimentos');
const valorClientes = document.getElementById('valorClientes');
const valorDias = document.getElementById('valorDias');
const listaReceitaServicos = document.getElementById('listaReceitaServicos');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();

menuToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function carregarRelatorio() {
  const dados = await apiFetch(`/relatorio?ano=${anoSelecionado}&mes=${mesSelecionado + 1}`);

  valorReceita.textContent = formatarMoeda(dados.receitaTotal);
  valorAtendimentos.textContent = dados.totalAtendimentos;
  valorClientes.textContent = dados.clientesAtendidos;
  valorDias.textContent = dados.diasTrabalhados;

  const servicos = Object.entries(dados.receitaPorServico).sort((a, b) => b[1] - a[1]);
  listaReceitaServicos.innerHTML = servicos.length
    ? servicos.map(([servico, valor]) => `<li>${escapeHtml(servico)} — ${formatarMoeda(valor)}</li>`).join('')
    : '<li>Nenhum atendimento neste período.</li>';
}

selectMesRelatorio?.addEventListener('change', (event) => {
  mesSelecionado = Number(event.target.value);
  carregarRelatorio();
});

selectAnoRelatorio?.addEventListener('change', (event) => {
  anoSelecionado = Number(event.target.value);
  carregarRelatorio();
});

async function iniciar() {
  popularSeletoresMesAno(selectMesRelatorio, selectAnoRelatorio, mesSelecionado, anoSelecionado);

  try {
    await apiFetch('/profissionais/me');
  } catch (error) {
    if (error.status === 401) {
      window.location.href = 'profissional.html';
    }
    return;
  }

  await carregarRelatorio();
}

iniciar();
