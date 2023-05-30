import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import userRouter from './user';
import mailService from '@/services/mail';
import activityRouter from './activity';
import eventRouter from './event';
import orderRouter from './order';
import ticketRouter from './ticket';

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
router.get('/', async (req: Request, res: Response) => {
  const mailOptions = {
    from: 'duenzo1010@gmail.com',
    to: 'bonnenuit1010@gmail.com',
    subject: '',
    text: 'Test',
  };

  await (await mailService).sendMail(mailOptions);

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

router.post('/mail', async (req: Request, res: Response) => {
  const { subject, text } = req.body;
  const mailOptions = {
    from: 'duenzo1010@gmail.com',
    to: 'bonnenuit1010@gmail.com',
    subject,
    text,
  };

  await mailService.sendMail(mailOptions);

  res.writeHead(200, headers);
  res.write(
    JSON.stringify({
      status: 'success',
      message: 'Email sent successfully',
    }),
  );
  res.end();
});

router.post('/verifiycode', async (req: Request, res: Response) => {
  const userMail = req.body?.email || process.env.USER_MAIL;

  const { verificationCode } = await mailService.sendVerificationCode(userMail);

  res.writeHead(200, headers);
  res.write(
    JSON.stringify({
      status: 'success',
      message: 'VerificationCode sent successfully',
      verificationCode,
    }),
  );
  res.end();
});

/* Swagger */
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.use('/user', userRouter);
router.use('/activities', activityRouter);
router.use('/events', eventRouter);
router.use('/orders', orderRouter);
router.use('/tickets', ticketRouter);

export default router;
