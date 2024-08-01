USE war_game;

CREATE TABLE IF NOT EXISTS classes (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    attributes JSON
);

CREATE TABLE IF NOT EXISTS characters (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    race VARCHAR(255) NOT NULL,
    class_id CHAR(36),
    hp INT DEFAULT 2000,
    maxHp INT DEFAULT 2000,
    ac INT DEFAULT 0,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS potions (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    effects JSON,
    utility VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS spells (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    manaCost INT DEFAULT 0,
    damage INT DEFAULT 0,
    duration INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gears (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    armour INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS weapons (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    damage INT NOT NULL
);

CREATE TABLE IF NOT EXISTS wizards (
    character_id CHAR(36) PRIMARY KEY REFERENCES characters(id),
    mana INT DEFAULT 1000,
    maxMana INT DEFAULT 1000
);

CREATE TABLE IF NOT EXISTS character_potions (
    character_id CHAR(36),
    potion_id CHAR(36),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (potion_id) REFERENCES potions(id),
    PRIMARY KEY (character_id, potion_id)
);

CREATE TABLE IF NOT EXISTS character_weapons (
    character_id CHAR(36),
    weapon_id CHAR(36),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (weapon_id) REFERENCES weapons(id),
    PRIMARY KEY (character_id, weapon_id)
);

CREATE TABLE IF NOT EXISTS character_gear (
    character_id CHAR(36),
    gear_id CHAR(36),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (gear_id) REFERENCES gears(id),
    PRIMARY KEY (character_id, gear_id)
);

CREATE TABLE IF NOT EXISTS wizard_spells (
    character_id CHAR(36),
    spell_id CHAR(36),
    FOREIGN KEY (character_id) REFERENCES characters(id),
    FOREIGN KEY (spell_id) REFERENCES spells(id),
    PRIMARY KEY (character_id, spell_id)
);
