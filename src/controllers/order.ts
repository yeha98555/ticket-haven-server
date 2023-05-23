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
};

export default orderController;
