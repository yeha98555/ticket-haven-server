import { NotFoundException } from '@/exceptions/NotFoundException';
import { IActivity } from '@/models/activity';
import OrderModel from '@/models/order';
import TicketModel from '@/models/ticket';
import { IUser } from '@/models/user';

const orderService = {
  getOrderInfo: async (userId: string, orderNo: string) => {
    const order = await OrderModel.findOne({
      order_no: orderNo,
      user_id: userId,
    })
      .populate<{ user_id: IUser }>('user_id')
      .populate<{ activity_id: IActivity }>('activity_id');

    if (!order) throw new NotFoundException();

    const tickets = await TicketModel.find({ order_id: order?._id });

    const totalPrice = tickets.reduce((accu, t) => accu + t.price, 0);
    const event = order.activity_id.events.find((e) =>
      e._id?.equals(order.event_id),
    );

    const returnTickets = tickets.map((t) => {
      return {
        id: t._id,
        ticketNo: t.ticket_no,
        subAreaId: t.subarea_id,
        subAreaName: order.activity_id.areas
          .map((a) => a.subareas)
          .flat()
          .find((a) => a._id?.equals(t.subarea_id))?.name,
        price: t.price,
        seat: t.seat,
        isUsed: t.is_used,
      };
    });

    return {
      id: order._id,
      orderNo: order.order_no,
      createAt: order.create_at,
      status: order.status,
      price: totalPrice,
      user: {
        id: order.user_id._id,
        name: order.user_id.username,
        email: order.user_id.email,
        cellphone: order.user_id.phone,
      },
      activity: {
        id: order.activity_id._id,
        name: order.activity_id.name,
        location: order.activity_id.location,
        eventId: event?._id,
        eventStartTime: event?.start_at,
        eventEndTime: event?.end_at,
      },
      tickets: returnTickets,
    };
  },
};

export default orderService;
