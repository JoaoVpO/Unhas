require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  console.log('Conectado ao banco. Aplicando schema...');

  await conn.query(`
    DROP TABLE IF EXISTS agendamentos;
    DROP TABLE IF EXISTS clientes;
    DROP TABLE IF EXISTS profissionais;

    CREATE TABLE clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE profissionais (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(120) NOT NULL UNIQUE,
      senha_hash VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE agendamentos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL,
      data DATE NOT NULL,
      horario VARCHAR(5) NOT NULL,
      servico VARCHAR(60) NOT NULL DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'confirmado',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_agendamentos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
      CONSTRAINT uniq_data_horario UNIQUE (data, horario)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);

  console.log('Schema aplicado com sucesso: clientes, profissionais, agendamentos.');
  console.log('(A tabela "servicos" foi mantida como estava, sem uso no momento.)');

  await conn.end();
}

main().catch((err) => {
  console.error('ERRO ao aplicar schema:', err.message);
  process.exit(1);
});