import { Router } from 'express';
import { isAuth } from '@/middleware/auth';
import ticketController from '@/controllers/ticket';

const ticketRouter = Router();

ticketRouter.get('/', isAuth, ticketController.getTickets);
ticketRouter.post(
  '/:ticketNo/check-in-token',
  isAuth,
  ticketController.checkInToken,
);
ticketRouter.post(
  '/:ticketNo/share-code',
  isAuth,
  ticketController.generateShareCode,
);

export default ticketRouter;
