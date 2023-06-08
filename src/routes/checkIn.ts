import { Router } from 'express';
import checkInController from '@/controllers/checkIn';
import { validateRequestQuery } from '@/middleware/paramsValidator';
import { z } from 'zod';

const checkInRouter = Router();

checkInRouter.get(
  '/info',
  validateRequestQuery(
    z.object({
      inspectorToken: z.string(),
      ticketToken: z.string(),
    }),
  ),
  checkInController.getCheckInInfo,
);

export default checkInRouter;
