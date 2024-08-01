const fs = require('fs');
const path = require('path');
const pool = require('./db');

const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 10;

async function executeSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const connection = await pool.getConnection();
  try {
    const statements = sql.split(';').filter(statement => statement.trim());
    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }
}

async function setupDatabase(retries = 0) {
  try {
    console.log('Creating database...');
    await executeSqlFile(path.join(__dirname, 'create-database.sql'));

    console.log('Creating tables...');
    await executeSqlFile(path.join(__dirname, 'create-tables.sql'));

    console.log('Database setup completed');
  } catch (error) {
    console.error('Error setting up the database:', error);

    if (retries < MAX_RETRIES) {
      console.log(`Retrying to connect in ${RETRY_INTERVAL / 1000} seconds...`);
      setTimeout(() => setupDatabase(retries + 1), RETRY_INTERVAL);
    } else {
      throw error;
    }
  }
}

module.exports = setupDatabase;

