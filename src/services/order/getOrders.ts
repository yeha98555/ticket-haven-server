import { NotFoundException } from '@/exceptions/NotFoundException';
import OrderModel from '@/models/order';
import ActivityModel from '@/models/activity';

const getOrders = async (page: number) => {
  if (page < 1) throw new NotFoundException();
  const onePageLimit = 5;
  const ordersTotal = await OrderModel.countDocuments();
  const totalPage = ordersTotal > onePageLimit ? Math.floor(ordersTotal / onePageLimit) : 1;

  if(page > totalPage) throw new NotFoundException();
  const nextPage = totalPage < page ? page + 1 : null;
  const ordersIndex = await OrderModel.find({}).skip((page - 1) * onePageLimit).limit(onePageLimit);
  const orders: object[] = [];

  for(let i = 0; i < ordersIndex.length; i++){
    const orderId = ordersIndex[i]._id;
    const activityId = ordersIndex[i].activity_id;
    const activity = await ActivityModel.findOne(activityId);

    if (!activity) continue;
    orders.push({
      id: orderId,
      name: activity.name,
      location: activity.location,
      startTime: activity.start_at,
    })
  }

  if (!ordersIndex) throw new NotFoundException();
  return {nextPage, totalPage, orders};
};

export default getOrders;
