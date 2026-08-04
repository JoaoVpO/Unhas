const SERVICOS = {
  'Cuidados Básicos': ['Cutilagem', 'Corte e Lixamento', 'Esmaltação tradicional'],
  'Técnicas e Esmaltações Especiais': ['Esmaltação em gel', 'Blindagem', 'Spa das Mãos'],
  'Alongamento e Decoração': ['Alongamento de Unhas', 'Manutenção e Conserto', 'Nail Art']
};

const SERVICOS_VALIDOS = Object.values(SERVICOS).flat();

module.exports = {
  HORARIOS_PADRAO: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
  SERVICOS,
  SERVICOS_VALIDOS
};