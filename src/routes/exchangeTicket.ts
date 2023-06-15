import { Router } from 'express';
import { isAuth } from '@/middleware/auth';
import exchangeTicketController from '@/controllers/exchangeTicket';
import { validateRequestBody } from '@/middleware/paramsValidator';
import { z } from 'zod';

const exchangeTicketRouter = Router();

exchangeTicketRouter.post(
  '/',
  isAuth,
  validateRequestBody(
    z.object({
      ticketNo: z.string(),
      shareCode: z.string(),
    }),
  ),
  exchangeTicketController.exchangeTicket,
);

export default exchangeTicketRouter;
