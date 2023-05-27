import { Router } from 'express';
import { isAuth } from '@/middleware/auth';
import ticketController from '@/controllers/ticket';

const ticketRouter = Router();

ticketRouter.get('/', isAuth, ticketController.getTickets);

export default ticketRouter;
