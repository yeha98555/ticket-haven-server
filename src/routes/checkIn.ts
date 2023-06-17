import { Router } from 'express';
import checkInController from '@/controllers/checkIn';
import {
  validateRequestBody,
  validateRequestQuery,
} from '@/middleware/paramsValidator';
import { z } from 'zod';

const checkInRouter = Router();

checkInRouter.post(
  '/',
  validateRequestBody(
    z.object({
      inspectorToken: z.string(),
      ticketToken: z.string(),
    }),
  ),
  checkInController.checkIn,
);

checkInRouter.get(
  '/ticket',
  validateRequestQuery(
    z.object({
      inspectorToken: z.string(),
      ticketToken: z.string(),
    }),
  ),
  checkInController.getCheckInInfo,
);

checkInRouter.get(
  '/event',
  validateRequestQuery(
    z.object({
      authId: z.string(),
    }),
  ),
  checkInController.getEventInfo,
);

export default checkInRouter;
