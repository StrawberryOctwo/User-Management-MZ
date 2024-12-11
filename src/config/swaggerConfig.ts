import { swaggerSchemas } from './swaggerSchemas';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for your project',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}/api/`, 
                description: 'Development server',
            },
        ],
        components: {
            schemas: swaggerSchemas,
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [], 
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], 
};

export default swaggerOptions;

