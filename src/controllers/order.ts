import { NotFoundException } from '@/exceptions/NotFoundException';
import OrderModel from '@/models/order';
import newebService from '@/services/neweb';
import orderService from '@/services/order';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';

const orderController = {
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
    const order = await OrderModel.findOne({ user_id: req.userId }).byNo(
      req.params.orderNo,
    );
    if (!order) throw new NotFoundException();

    const result = await orderService.addSeats({ order, ...req.body });
    res.json(Body.success(result));
  }),
  deleteSeat: catchAsyncError(async (req, res) => {
    const order = await OrderModel.findOne({ user_id: req.userId }).byNo(
      req.params.orderNo,
    );
    if (!order) throw new NotFoundException();

    const result = await orderService.deleteSeat({ order, ...req.body });
    res.json(Body.success(result));
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
    const result = await newebService.decrypt(req.body.TradeInfo);

    if (result) {
      res.set('OrderNo', JSON.stringify(result));
    }

    res.redirect('http://localhost:3000/purchasing-process/complete');
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
