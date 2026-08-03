const pool = require('./db');

async function main() {
  const [tables] = await pool.query('SHOW TABLES');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    console.log(`\n=== ${tableName} ===`);
    const [cols] = await pool.query(`SHOW CREATE TABLE \`${tableName}\``);
    console.log(cols[0]['Create Table']);
    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 5`);
    console.log(`-- ${rows.length} sample row(s) --`);
    console.log(JSON.stringify(rows, null, 2));
  }

  await pool.end();
}

main().catch((err) => {
  console.error('ERRO:', err.message);
  process.exit(1);
});