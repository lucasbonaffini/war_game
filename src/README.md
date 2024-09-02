- Project Description

War game API
This API allows you to manage characters, classes, potions, gears and weapons in a game. Below you'll find the details on how to use the API, including the necessary steps to create a class, character, and specific instances.

Getting Started
Prerequisites
Before you start using the API, ensure you have the following installed:

Node.js
npm
dotenv
express
mysql2
swagger-jsdoc
swagger-ui-express
uuid
docker

Installation

`git clone <https://github.com/lucasbonaffini/war_game.git>`

`cd src`

`npm install`

Running the API
To start the API server, use the following command:

`docker-compose up -d`

API Endpoints

<http://localhost:3000/api-docs>

*Actions*

Attack
Heal (Using Potion to restore HP)
addPotion
addGear
addWeapon

*Important Notes*

Creating Classes and Characters:

Before creating a character, ensure you have created a class. You need to assign a class to a character during creation.


Creating Potions:

It is also important to be able to make use of the methods to recover mana and hp, to have created the potions for it. I leave a model of both so that they can be created from swagger for its use.

{
  "name": "string",
  "effects": {
    "hpRestore": 0,
    "manaRestore": 0,
    "increaseDamage": 0
  },
  "utility": "string"
}

Creating and adding gear:

Depending on the type of equipment you create will add points to the ac, which will help to reduce the attack damage. It is important to use the following names in order to add the corresponding ac points

'chestplate' - ac + 400;
                  
'cleats' - ac + 100;
                  
'leggings' - ac + 200;
         
'skullcap' - ac + 300; 

Attack action:

if you create a `rouge` or `barbarian` class, when you call the attack method, your dexterity or strength statistic is added to the damage, respectively

- BD Schema

The database for this project is relational. It is composed of a main class `Character`, from which Wizard extends, which handles its own extra attributes such as mana, maxMana.
Then we can observe that the rest of classes represent components that a character can have. Such as `Gear`, `Weapon`, `Class` (to define if it is a rogue, a barbarian), and `Potion`

Gear presents a pivot table character_gears since it is an n to n relationship. As for weapon and potion (character_weapons and character_potions)

Here is the path to the db schema img

<src/war_game.png>

# Database Schema Documentation

## Classes Table

| Column      | Data Type  | Description                        |
|-------------|------------|------------------------------------|
| id          | CHAR(36)   | Primary key                        |
| name        | VARCHAR(255)| Name of the class                 |
| description | TEXT       | Description of the class           |
| attributes  | JSON       | Additional attributes in JSON format|

## Characters Table

| Column     | Data Type  | Description                        |
|------------|------------|------------------------------------|
| id         | CHAR(36)   | Primary key                        |
| name       | VARCHAR(255)| Name of the character              |
| race       | VARCHAR(255)| Race of the character              |
| class_id   | CHAR(36)   | Foreign key referencing `classes.id`|
| hp         | INT        | Current hit points (default 2000)  |
| maxHp      | INT        | Maximum hit points (default 2000)  |
| ac         | INT        | Armor class (default 0)            |

## Potions Table

| Column     | Data Type  | Description                        |
|------------|------------|------------------------------------|
| id         | CHAR(36)   | Primary key                        |
| name       | VARCHAR(255)| Name of the potion                 |
| effects    | JSON       | Effects of the potion in JSON format|
| utility    | VARCHAR(255)| Utility of the potion              |



## Gears Table

| Column     | Data Type  | Description                        |
|------------|------------|------------------------------------|
| id         | CHAR(36)   | Primary key                        |
| name       | VARCHAR(255)| Name of the gear                   |
| category   | VARCHAR(255)| Category of the gear               |
| armour     | INTEGER    | Armour value provided by the gear  |

## Weapons Table

| Column     | Data Type  | Description                        |
|------------|------------|------------------------------------|
| id         | CHAR(36)   | Primary key                        |
| name       | VARCHAR(255)| Name of the weapon                 |
| category   | VARCHAR(255)| Category of the weapon             |
| damage     | INT        | Damage value of the weapon         |


## Character_Potions Table

| Column        | Data Type  | Description                        |
|---------------|------------|------------------------------------|
| character_id  | CHAR(36)   | Foreign key referencing `characters.id` |
| potion_id     | CHAR(36)   | Foreign key referencing `potions.id`|
| PRIMARY KEY   | (character_id, potion_id) | Composite primary key |

## Character_Weapons Table

| Column        | Data Type  | Description                        |
|---------------|------------|------------------------------------|
| character_id  | CHAR(36)   | Foreign key referencing `characters.id` |
| weapon_id     | CHAR(36)   | Foreign key referencing `weapons.id`|
| PRIMARY KEY   | (character_id, weapon_id) | Composite primary key |

## Character_Gear Table

| Column        | Data Type  | Description                        |
|---------------|------------|------------------------------------|
| character_id  | CHAR(36)   | Foreign key referencing `characters.id` |
| gear_id       | CHAR(36)   | Foreign key referencing `gears.id`|
| PRIMARY KEY   | (character_id, gear_id) | Composite primary key |




Here is the link for the coverage test in Coveralls

https://coveralls.io/github/lucasbonaffini/war_game



