const express = require('express');
const app = express();
const characterRoutes = require('./routes/CharacterRouter');
const potionRoutes = require('./routes/PotionRouter');
const classRoutes = require('./routes/ClassRouter');
const wizardRoutes = require('./routes/WizardRouter');
const configureSwagger = require('./config/swagger');
const setupDatabase = require('./config/setupDatabase');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);

app.use(express.json());

// Run database setup
setupDatabase()
  .then(() => {
    // Routes
    app.use('/characters', characterRoutes);
    app.use('/potions', potionRoutes);
    app.use('/classes', classRoutes);
    app.use('/wizards', wizardRoutes);

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
    res.status(500).json({ error: 'Something went wrong!' });
  });

  module.exports = app;