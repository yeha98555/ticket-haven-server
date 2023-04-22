import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TicketHaven API',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
  },
  apis: ['**/*.ts'], // 指定 API 的路徑，可以使用 glob pattern
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
