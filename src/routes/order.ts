import { Router } from 'express';
import { isAuth } from '@/middleware/auth';
import orderController from '@/controllers/order';
import { validateRequestParams } from '@/middleware/paramsValidator';
import { z } from 'zod';

const orderRouter = Router();

orderRouter.get(
  '/:orderNo',
  isAuth,
  validateRequestParams(z.object({ orderNo: z.string() })),
  orderController.getOrderInfo,
);

export default orderRouter;
