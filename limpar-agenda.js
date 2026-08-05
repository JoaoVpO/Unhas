require('dotenv').config();
const pool = require('./db');

async function main() {
  const [resultado] = await pool.query('DELETE FROM agendamentos');
  console.log(`Agendamentos removidos: ${resultado.affectedRows}`);
  await pool.end();
}

main().catch((err) => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
