import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import userRoute from './user';

const router = Router();

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

/* GET home page. */
/**
 * @swagger
 * tags:
 *   name: Example
 *   description: Example API
 *
 * /:
 *   get:
 *     summary: Example endpoint
 *     description: Returns a welcome message
 *     tags: [Example]
 *     responses:
 *       '200':
 *         description: A welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Welcome to the API
 */
router.get('/', (req: Request, res: Response) => {
  res.writeHead(200, headers);
  res.write(
    JSON.stringify({
      status: 'success',
      message: 'Welcome to the API',
    }),
  );
  res.end();
  // res.send('Welcome to the API');
});

/* Swagger */
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.use('/api/user', userRoute);

export default router;
