import orderService from '@/services/order';
import catchAsyncError from '@/utils/catchAsyncError';
import { Body } from '@/utils/response';

const orderController = {
  getOrderInfo: catchAsyncError(async (req, res) => {
    const order = await orderService.getOrderInfo(req.params.orderNo);
    res.json(Body.success(order));
  }),
};

export default orderController;
