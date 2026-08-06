const SERVICOS = {
  'Cuidados Básicos': ['Cutilagem', 'Corte e Lixamento', 'Esmaltação tradicional'],
  'Técnicas e Esmaltações Especiais': ['Esmaltação em gel', 'Blindagem', 'Spa das Mãos'],
  'Alongamento e Decoração': ['Alongamento de Unhas', 'Manutenção e Conserto', 'Nail Art']
};

const SERVICOS_VALIDOS = Object.values(SERVICOS).flat();

// Preencha o preço (em reais) de cada serviço. Ficam em 0 até serem definidos.
const PRECOS_SERVICOS = {
  'Cutilagem': 0,
  'Corte e Lixamento': 0,
  'Esmaltação tradicional': 0,
  'Esmaltação em gel': 0,
  'Blindagem': 0,
  'Spa das Mãos': 0,
  'Alongamento de Unhas': 0,
  'Manutenção e Conserto': 0,
  'Nail Art': 0
};

module.exports = {
  HORARIOS_PADRAO: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
  SERVICOS,
  SERVICOS_VALIDOS,
  PRECOS_SERVICOS
};