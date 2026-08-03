const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const ANO_INICIAL = 2026;
const ANO_FINAL = 2100;

function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

async function apiFetch(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: opcoes.method || 'GET',
      credentials: 'include',
      headers: opcoes.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opcoes.body ? JSON.stringify(opcoes.body) : undefined
    });
  } catch (error) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
  }

  if (resposta.status === 204) {
    return null;
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = new Error(dados?.erro || 'Ocorreu um erro. Tente novamente.');
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}

function popularSeletoresMesAno(selectMes, selectAno, mesSelecionado, anoSelecionado) {
  selectMes.innerHTML = MESES.map((mes, index) => `<option value="${index}" ${index === mesSelecionado ? 'selected' : ''}>${mes}</option>`).join('');

  const anos = Array.from({ length: ANO_FINAL - ANO_INICIAL + 1 }, (_, index) => ANO_INICIAL + index);
  selectAno.innerHTML = anos.map((ano) => `<option value="${ano}" ${ano === anoSelecionado ? 'selected' : ''}>${ano}</option>`).join('');
}

function renderizarCalendario(container, { ano, mes, temDestaque, estaAtivo, aoClicarDia }) {
  const firstDay = new Date(ano, mes, 1);
  const lastDay = new Date(ano, mes + 1, 0);
  const totalDays = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  container.innerHTML = '';

  const cabecalho = document.createElement('div');
  cabecalho.className = 'calendar-header';
  cabecalho.textContent = `${MESES[mes]} ${ano}`;
  container.appendChild(cabecalho);

  DIAS_SEMANA.forEach((dia) => {
    const span = document.createElement('div');
    span.className = 'weekday';
    span.textContent = dia;
    container.appendChild(span);
  });

  for (let i = 0; i < startWeekday; i += 1) {
    const vazio = document.createElement('div');
    vazio.className = 'day-btn empty-day';
    container.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDays; dia += 1) {
    const data = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'day-btn';
    botao.textContent = dia;
    botao.title = new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    if (temDestaque?.(data)) {
      botao.classList.add('has-slots');
    }
    if (estaAtivo?.(data)) {
      botao.classList.add('active');
    }

    botao.addEventListener('click', () => aoClicarDia(data, botao));
    container.appendChild(botao);
  }
}

function formatarDataBR(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
}