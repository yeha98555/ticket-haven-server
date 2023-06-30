import { NotFoundException } from '@/exceptions/NotFoundException';
import OrderModel from '@/models/order';
import newebService from '@/services/neweb';
import orderService from '@/services/order';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';
import { z } from 'zod';

export const validations = {
  getOrders: z.object({
    page: z.coerce.number().min(1),
    pageSize: z.coerce.number().min(1),
    status: z.union([z.literal('completed'), z.literal('unpaid')]),
  }),
};

const orderController = {
  getOrders: catchAsyncError(async (req, res) => {
    const { page, pageSize, status } = req.query as unknown as z.infer<
      typeof validations.getOrders
    >;

    const { data, ...pagination } = await orderService.getOrders({
      userId: req.userId!,
      status,
      page,
      pageSize,
    });

    res.json(Body.success(data).pagination(pagination));
  }),
  getOrderInfo: catchAsyncError(async (req, res) => {
    const order = await orderService.getOrderInfo(
      req.userId!,
      req.params.orderNo,
    );
    res.json(Body.success(order));
  }),
  addOrder: catchAsyncError(async (req, res) => {
    const orderInfo = await orderService.addOrder(req.userId!, req.body);
    res.json(Body.success(orderInfo));
  }),
  addSeats: catchAsyncError(async (req, res) => {
    await orderService.addSeats({
      userId: req.userId,
      orderNo: req.params.orderNo,
      ...req.body,
    });

    const orderInfo = await orderService.getOrderInfo(
      req.userId!,
      req.params.orderNo,
    );

    res.json(Body.success(orderInfo));
  }),
  deleteSeat: catchAsyncError(async (req, res) => {
    await orderService.deleteSeat({
      userId: req.userId,
      orderNo: req.params.orderNo,
      ...req.body,
    });

    const orderInfo = await orderService.getOrderInfo(
      req.userId!,
      req.params.orderNo,
    );

    res.json(Body.success(orderInfo));
  }),
  payment: catchAsyncError(async (req, res) => {
    const result = await orderService.payment(req.userId!, req.params.orderNo);
    res.json(Body.success(result));
  }),
  paymentNotify: catchAsyncError(async (req, res) => {
    const result = await orderService.paymentNotify(req.body.TradeInfo);

    // Respond to NewebPay
    if (result) {
      res.status(200).send('OK');
    } else {
      res.status(500).send('Failed');
    }
  }),
  paymentReturn: catchAsyncError(async (req, res) => {
    const info = await newebService.decrypt(req.body.TradeInfo);
    const orderNo = info.Result.MerchantOrderNo;
    const success = info.Status === 'SUCCESS';

    res.redirect(
      `${process.env.PAYMENT_RETURN_URL}?orderNo=${orderNo}&success=${success}`,
    );
  }),
  cancelOrder: catchAsyncError(async (req, res) => {
    const result = await orderService.cancelOrder(
      req.userId!,
      req.params.orderNo,
    );
    res.json(Body.success(result));
  }),
};

export default orderController;
