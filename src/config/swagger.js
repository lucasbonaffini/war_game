const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Roll war game API',
            version: '1.0.0',
            description: 'API documentation for my war roll game final project from Solvd Laba',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Replace with your server URL
            },
        ],
    },
    
    apis: [
        './routes/*.js',
        path.resolve(__dirname, './swagger.yaml'),
    ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

