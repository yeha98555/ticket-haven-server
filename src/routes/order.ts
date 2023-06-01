import { Router } from 'express';
import { isAuth } from '@/middleware/auth';
import orderController from '@/controllers/order';
import {
  validateRequestBody,
  validateRequestParams,
} from '@/middleware/paramsValidator';
import { z } from 'zod';

const orderRouter = Router();

orderRouter.get(
  '/:orderNo',
  isAuth,
  validateRequestParams(z.object({ orderNo: z.string() })),
  orderController.getOrderInfo,
);

orderRouter.post(
  '/',
  isAuth,
  validateRequestBody(
    z.object({
      activityId: z.string(),
      eventId: z.string(),
      areaId: z.string(),
      subAreaId: z.string(),
      seatAmount: z.number().max(4),
    }),
  ),
  orderController.addOrder,
);

orderRouter.patch(
  '/:orderNo/seats',
  isAuth,
  validateRequestBody(
    z.object({
      areaId: z.string(),
      subAreaId: z.string(),
      amount: z.number().max(4),
    }),
  ),
  orderController.addSeats,
);

orderRouter.delete(
  '/:orderNo/seats',
  isAuth,
  validateRequestBody(
    z.object({
      areaId: z.string(),
      subAreaId: z.string(),
      row: z.number(),
      seat: z.number(),
    }),
  ),
  orderController.deleteSeat,
);

orderRouter.get(
  '/:orderNo/payment',
  isAuth,
  validateRequestParams(z.object({ orderNo: z.string() })),
  orderController.payment,
);

orderRouter.post(
  '/payment_notify',
  validateRequestBody(
    z.object({
      TradeInfo: z.string(),
    }),
  ),
  orderController.paymentNotify,
);

orderRouter.post(
  '/payment_return',
  validateRequestBody(
    z.object({
      TradeInfo: z.string(),
    }),
  ),
  orderController.paymentReturn,
);

orderRouter.delete('/:orderNo', isAuth, orderController.cancelOrder);

export default orderRouter;
