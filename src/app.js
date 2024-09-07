const express = require('express');
const app = express();
const authMiddleware = require('./security/authMiddleware')
const authRoutes = require('./routes/AuthRouter');
const characterRoutes = require('./routes/CharacterRouter');
const potionRoutes = require('./routes/PotionRouter');
const classRoutes = require('./routes/ClassRouter');
const wizardRoutes = require('./routes/WizardRouter');
const gearRoutes = require('./routes/GearRouter');
const weaponRoutes = require('./routes/WeaponRouter');
const spellRoutes = require('./routes/SpellRouter');
const configureSwagger = require('./config/swagger');
const setupDatabase = require('./config/setupDatabase');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

app.use(express.json());

// Run database setup
setupDatabase()
  .then(() => {
    // Routes
    app.use('/auth', authRoutes);

    app.use('/characters', authMiddleware, characterRoutes);
    app.use('/potions', authMiddleware, potionRoutes);
    app.use('/classes', authMiddleware, classRoutes);
    app.use('/wizards', authMiddleware, wizardRoutes);
    app.use('/gears', authMiddleware, gearRoutes);
    app.use('/weapons', authMiddleware, weaponRoutes);
    app.use('/spells', authMiddleware, spellRoutes);

    // Swagger configuration
    configureSwagger(app);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error setting up the database:', error);
    process.exit(1); // Exit with a failure code
  });

  // Middleware for handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  module.exports = app;