import addOrder from './addOrder';
import addSeats from './addSeats';
import createOrderNo from './createOrderNo';
import deleteSeat from './deleteSeat';
import getOrderInfo from './getOrderInfo';
import getOrders from './getOrders';

const orderService = {
  getOrders,
  getOrderInfo,
  addOrder,
  createOrderNo,
  addSeats,
  deleteSeat,
};

export default orderService;
