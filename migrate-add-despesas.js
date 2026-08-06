require('dotenv').config();
const pool = require('./db');

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS despesas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profissional_id INT NOT NULL,
      descricao VARCHAR(120) NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      data DATE NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_despesas_profissional FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  console.log('Tabela "despesas" pronta.');
  await pool.end();
}

main().catch((err) => {
  console.error('ERRO:', err.message);
  process.exit(1);
});
