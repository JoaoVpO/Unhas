require('dotenv').config();
const pool = require('./db');

async function main() {
  try {
    await pool.query("ALTER TABLE agendamentos ADD COLUMN servico VARCHAR(60) NOT NULL DEFAULT ''");
    console.log('Coluna "servico" adicionada com sucesso em agendamentos.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Coluna "servico" já existe, nada a fazer.');
    } else {
      throw error;
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error('ERRO ao adicionar coluna:', err.message);
  process.exit(1);
});
