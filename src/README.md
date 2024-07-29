- Project Description

War game API
This API allows you to manage characters, classes, wizards, potions, gears, weapons and spells in a game. Below you'll find the details on how to use the API, including the necessary steps to create a class, character, and specific instances such as a wizard.

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
castSpell
Heal (Using Potion to restore HP)
Restore Mana (Using Potion to restore Mana)
addPotion
addSpell
addGear
addWeapon

*Important Notes*

Creating Classes and Characters:

Before creating a character, ensure you have created a class. You need to assign a class to a character during creation.

Creating a Wizard:

To create a wizard, you must first create a class with the name "Wizard". This allows you to create a wizard character and manage wizard-specific attributes such as mana.

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
Then we can observe that the rest of classes represent components that a character can have. Such as `Gear`, `Weapon`, `Class` (to define if it is a mage, a rogue, a barbarian), `Potion`, and `Spell`.

Gear presents a pivot table character_gears since it is an n to n relationship. As for weapon and potion (character_weapons and character_potions)
On the other hand, the Spell class has the same n to n relationship, but in this case with the Wizard class, since they are the ones who can make use of their magic to be able to cast them

Here is the path to the db schema img

<src/war_game.png>

