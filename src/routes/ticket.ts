import { Router } from 'express';
import { isAuth } from '@/middleware/auth';
import { validateRequestBody } from '@/middleware/paramsValidator';
import { z } from 'zod';
import ticketController from '@/controllers/ticket';

const ticketRouter = Router();

ticketRouter.get('/', isAuth, ticketController.getTickets);
ticketRouter.post('/ticketCode',  validateRequestBody(
  z.object({
    ticketNo: z.string(),
  }),
),
ticketController.createTicketCode);

export default ticketRouter;
