const selectMesRelatorio = document.getElementById('selectMesRelatorio');
const selectAnoRelatorio = document.getElementById('selectAnoRelatorio');
const valorReceita = document.getElementById('valorReceita');
const valorDespesas = document.getElementById('valorDespesas');
const valorLucro = document.getElementById('valorLucro');
const valorAtendimentos = document.getElementById('valorAtendimentos');
const valorClientes = document.getElementById('valorClientes');
const valorDias = document.getElementById('valorDias');
const valorHoras = document.getElementById('valorHoras');
const listaReceitaServicos = document.getElementById('listaReceitaServicos');
const btnCompartilharRelatorio = document.getElementById('btnCompartilharRelatorio');
const formDespesa = document.getElementById('formDespesa');
const descricaoDespesa = document.getElementById('descricaoDespesa');
const valorDespesaInput = document.getElementById('valorDespesaInput');
const dataDespesa = document.getElementById('dataDespesa');
const mensagemDespesa = document.getElementById('mensagemDespesa');
const listaDespesas = document.getElementById('listaDespesas');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

let mesSelecionado = new Date().getMonth();
let anoSelecionado = new Date().getFullYear();
let ultimoRelatorio = null;

menuToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarHoras(minutos) {
  const horas = Math.floor(minutos / 60);
  const min = minutos % 60;
  return `${horas}:${String(min).padStart(2, '0')}`;
}

async function carregarRelatorio() {
  const dados = await apiFetch(`/relatorio?ano=${anoSelecionado}&mes=${mesSelecionado + 1}`);
  ultimoRelatorio = dados;

  valorReceita.textContent = formatarMoeda(dados.receitaTotal);
  valorDespesas.textContent = formatarMoeda(dados.despesaTotal);
  valorLucro.textContent = formatarMoeda(dados.lucro);
  valorAtendimentos.textContent = dados.totalAtendimentos;
  valorClientes.textContent = dados.clientesAtendidos;
  valorDias.textContent = dados.diasTrabalhados;
  valorHoras.textContent = formatarHoras(dados.minutosAtendidos);

  const servicos = Object.entries(dados.receitaPorServico).sort((a, b) => b[1] - a[1]);
  listaReceitaServicos.innerHTML = servicos.length
    ? servicos.map(([servico, valor]) => `<li>${escapeHtml(servico)} — ${formatarMoeda(valor)}</li>`).join('')
    : '<li>Nenhum atendimento neste período.</li>';
}

async function carregarDespesas() {
  const despesas = await apiFetch(`/despesas?ano=${anoSelecionado}&mes=${mesSelecionado + 1}`);

  listaDespesas.innerHTML = despesas.length
    ? despesas.map((item) => `
        <li>
          ${formatarDataBR(item.data)} — ${escapeHtml(item.descricao)} — ${formatarMoeda(item.valor)}
          <button type="button" class="reset-btn btn-remover-despesa" data-id="${item.id}" style="margin-left:8px;">Remover</button>
        </li>`).join('')
    : '<li>Nenhuma despesa registrada neste período.</li>';
}

listaDespesas.addEventListener('click', async (event) => {
  const target = event.target;
  if (!target.classList.contains('btn-remover-despesa')) return;

  const confirmar = window.confirm('Remover esta despesa?');
  if (!confirmar) return;

  try {
    await apiFetch(`/despesas/${target.dataset.id}`, { method: 'DELETE' });
    await carregarDespesas();
    await carregarRelatorio();
  } catch (error) {
    window.alert(error.message);
  }
});

formDespesa?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const descricao = descricaoDespesa.value.trim();
  const valor = Number(valorDespesaInput.value);
  const data = dataDespesa.value;

  if (!descricao || !valor || !data) {
    mensagemDespesa.textContent = 'Preencha descrição, valor e data.';
    return;
  }

  try {
    await apiFetch('/despesas', { method: 'POST', body: { descricao, valor, data } });
    formDespesa.reset();
    dataDespesa.value = new Date().toISOString().slice(0, 10);
    mensagemDespesa.textContent = '';
    await carregarDespesas();
    await carregarRelatorio();
  } catch (error) {
    mensagemDespesa.textContent = error.message;
  }
});

btnCompartilharRelatorio?.addEventListener('click', async () => {
  if (!ultimoRelatorio) return;

  const texto = `Relatório ${mesSelecionado + 1}/${anoSelecionado}\n` +
    `Receita: ${formatarMoeda(ultimoRelatorio.receitaTotal)}\n` +
    `Despesas: ${formatarMoeda(ultimoRelatorio.despesaTotal)}\n` +
    `Lucro: ${formatarMoeda(ultimoRelatorio.lucro)}\n` +
    `Atendimentos: ${ultimoRelatorio.totalAtendimentos}\n` +
    `Clientes atendidos: ${ultimoRelatorio.clientesAtendidos}\n` +
    `Dias trabalhados: ${ultimoRelatorio.diasTrabalhados}\n` +
    `Horas atendidas: ${formatarHoras(ultimoRelatorio.minutosAtendidos)}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Relatório Glow Beauty', text: texto });
    } catch (error) {
      // usuário cancelou o compartilhamento, nada a fazer
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(texto);
    window.alert('Resumo copiado para a área de transferência.');
  } catch (error) {
    window.alert(texto);
  }
});

selectMesRelatorio?.addEventListener('change', (event) => {
  mesSelecionado = Number(event.target.value);
  carregarRelatorio();
  carregarDespesas();
});

selectAnoRelatorio?.addEventListener('change', (event) => {
  anoSelecionado = Number(event.target.value);
  carregarRelatorio();
  carregarDespesas();
});

async function iniciar() {
  popularSeletoresMesAno(selectMesRelatorio, selectAnoRelatorio, mesSelecionado, anoSelecionado);
  dataDespesa.value = new Date().toISOString().slice(0, 10);

  try {
    await apiFetch('/profissionais/me');
  } catch (error) {
    if (error.status === 401) {
      window.location.href = 'profissional.html';
    }
    return;
  }

  await carregarRelatorio();
  await carregarDespesas();
}

iniciar();
