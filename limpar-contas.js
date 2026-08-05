require('dotenv').config();
const pool = require('./db');

const CLIENTE_ID_MANTER = 8;
const PROFISSIONAL_ID_MANTER = 3;

async function main() {
  const [clientesRemovidos] = await pool.query('DELETE FROM clientes WHERE id <> ?', [CLIENTE_ID_MANTER]);
  const [profissionaisRemovidos] = await pool.query('DELETE FROM profissionais WHERE id <> ?', [PROFISSIONAL_ID_MANTER]);

  console.log(`Clientes removidos: ${clientesRemovidos.affectedRows} (mantido id ${CLIENTE_ID_MANTER})`);
  console.log(`Profissionais removidos: ${profissionaisRemovidos.affectedRows} (mantido id ${PROFISSIONAL_ID_MANTER})`);
  console.log('Agendamentos dos clientes removidos foram apagados em cascata.');

  await pool.end();
}

main().catch((err) => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
