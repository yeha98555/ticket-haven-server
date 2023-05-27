import { Activity } from '@/models/activity';
import OrderModel from '@/models/order';
import TicketModel from '@/models/ticket';

type Ticket = {
  isShare: boolean;
  isUsed: boolean;
  ticketNo: string;
  seat: string;
};

type PartActivity = {
  name: string;
  address: string;
  startAt: Date;
  endAt: Date;
};

type GroupTickets = PartActivity & {
  orderId: string;
  activityId: string;
  tickets: Ticket[];
};

interface TicketProps {
  userId: string;
  page: number;
  pageSize: number;
}

const getAllTickets = async ({
  userId,
  page = 1,
  pageSize = 10,
}: TicketProps) => {
  const userFilter = { user_id: userId };

  // query order by user_id
  const totalOrderCount = await OrderModel.countDocuments(userFilter);
  const skipCount = (page - 1) * pageSize;

  const orders = await OrderModel.find(userFilter)
    .skip(skipCount)
    .limit(pageSize);

  if (orders.length === 0)
    return {
      page,
      pageSize,
      totalCount: 0,
      totalPages: 1,
      tickets: [],
    };

  const orderNumbers = orders.map((order) => order._id);
  const totalPages = Math.ceil(totalOrderCount / pageSize);

  // query tickets by order_id
  const tickets = await TicketModel.find({
    order_id: { $in: orderNumbers },
  }).populate<{ activity_id: Activity }>(
    'activity_id',
    'name address start_at end_at',
  );

  const groupTickets = tickets.reduce<GroupTickets[]>((result, item) => {
    const activityId = item.activity_id._id;
    const orderId = item.order_id;
    const group = result.find(
      (g) =>
        String(orderId) === g.orderId && String(activityId) === g.activityId,
    );

    const ticket = {
      isShare: item.order_id !== item.original_order_id,
      isUsed: item.is_used,
      ticketNo: item.ticket_no,
      seat: `${item.row}排 ${item.seat}號`,
    };

    if (group) {
      group.tickets.push(ticket);
    } else {
      result.push({
        orderId: String(item.order_id),
        activityId: String(item.activity_id._id),
        name: item.activity_id.name,
        startAt: item.activity_id.start_at,
        endAt: item.activity_id.end_at,
        address: item.activity_id.address,
        tickets: [ticket],
      });
    }

    return result;
  }, []);

  return {
    page,
    pageSize,
    totalCount: groupTickets.length,
    totalPages,
    tickets: groupTickets,
  };
};

export default getAllTickets;
