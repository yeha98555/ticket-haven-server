import addOrder from './addOrder';
import addSeats from './addSeats';
import createOrderNo from './createOrderNo';
import deleteSeat from './deleteSeat';
import getOrderInfo from './getOrderInfo';

const orderService = {
  getOrderInfo,
  addOrder,
  createOrderNo,
  addSeats,
  deleteSeat,
};

export default orderService;
