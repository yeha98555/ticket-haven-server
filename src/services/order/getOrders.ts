import { NotFoundException } from '@/exceptions/NotFoundException';
import OrderModel from '@/models/order';
import { Activity } from '@/models/activity';

const getOrders = async (userId: string, status: string, page: number) => {
  const onePageLimit = 5;
  const ordersTotal = await OrderModel.countDocuments({ user_id: userId , status: status });

  if(ordersTotal === 0) return { nextPage: null, totalPage: 0, orders: [] };
  const totalPage = ordersTotal > onePageLimit ? Math.ceil(ordersTotal / onePageLimit) : 1;

  if(page > totalPage) throw new NotFoundException();
  const nextPage = totalPage < page ? page + 1 : null;
  const ordersCatalog  = await OrderModel.find({ user_id: userId })
    .skip((page - 1) * onePageLimit)
    .limit(onePageLimit)
    .populate<{ activity_id: Activity }>('activity_id');

  const orders: object[] = [];

  for(let i = 0; i < ordersCatalog.length; i++){
    const order = ordersCatalog[i];
    const activity = ordersCatalog[i].activity_id;

    orders.push({
      id: order._id,
      status: order.status,
      name: activity.name,
      location: activity.location,
      startTime: activity.start_at,
    })
  }

  return { nextPage, totalPage, orders };
};

export default getOrders;
