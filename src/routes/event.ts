import { Router } from 'express';
import { validateRequestParams } from '@/middleware/paramsValidator';
import { z } from 'zod';
import eventController from '@/controllers/event';

const eventRouter = Router();

eventRouter.get(
  '/:eventId/seat-sell-status',
  validateRequestParams(z.object({ eventId: z.string() })),
  eventController.getSeatInfo,
);

eventRouter.post(
  '/:eventId/check-in-verify-token',
  eventController.generateCheckInVerifyToken,
);

export default eventRouter;
