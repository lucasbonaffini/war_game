const pool = require('./db');

async function setupDatabase() {
    try {
      const connection = await pool.getConnection();
      // Crea la base de datos si no existe
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
      await connection.release();
  
      // Crea las tablas si no existen
      await createTables(pool);
  
      console.log(`Database setup completed for ${process.env.DB_NAME}`);
    } catch (error) {
      console.error('Error setting up the database:', error);
      throw error;
    }
}

async function createTables(pool) { 
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            attributes JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS characters (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            race VARCHAR(255) NOT NULL,
            class_id CHAR(36),
            gear JSON,
            potions JSON,
            weapons JSON,
            hp INT DEFAULT 2000,
            maxHp INT DEFAULT 2000,
            ac INT DEFAULT 0,
            FOREIGN KEY (class_id) REFERENCES classes(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS potions (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            effect VARCHAR(255) NOT NULL,
            characterId CHAR(36),
            FOREIGN KEY (characterId) REFERENCES characters(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS spells (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            manaCost INT DEFAULT 0,
            damage INT DEFAULT 0,
            duration INT DEFAULT 0,            
            characterId CHAR(36),
            FOREIGN KEY (characterId) REFERENCES characters(id)
      )
    `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS gears (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(255) NOT NULL,
          characterId CHAR(36),
          FOREIGN KEY (characterId) REFERENCES characters(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS weapons (
          id CHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          damage INT NOT NULL,
          characterId CHAR(36),
          FOREIGN KEY (characterId) REFERENCES characters(id)
    )
  `);
    
    await connection.query(`
        CREATE TABLE IF NOT EXISTS wizards (
              character_id CHAR(36) PRIMARY KEY REFERENCES characters(id),
              mana INT DEFAULT 1000,
              maxMana INT DEFAULT 1000,
              spells JSON
        )
      `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS character_potions (
            character_id CHAR(36),
            potion_id CHAR(36),
            FOREIGN KEY (character_id) REFERENCES characters(id),
            FOREIGN KEY (potion_id) REFERENCES potions(id),
            PRIMARY KEY (character_id, potion_id)
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS character_weapons (
            character_id CHAR(36),
            weapon_id CHAR(36),
            FOREIGN KEY (character_id) REFERENCES characters(id),
            FOREIGN KEY (weapon_id) REFERENCES weapons(id),
            PRIMARY KEY (character_id, weapon_id)
    );`);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS character_gear (
            character_id CHAR(36),
            gear_id CHAR(36),
            FOREIGN KEY (character_id) REFERENCES characters(id),
            FOREIGN KEY (gear_id) REFERENCES gears(id),
            PRIMARY KEY (character_id, gear_id)
    )`);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS wizard_spells (
            character_id CHAR(36),
            spell_id CHAR(36),
            FOREIGN KEY (character_id) REFERENCES characters(id),
            FOREIGN KEY (spell_id) REFERENCES spells(id),
            PRIMARY KEY (character_id, spell_id)
    )`);

    await connection.release();
    console.log('Tables created successfully');

  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

module.exports = setupDatabase;
