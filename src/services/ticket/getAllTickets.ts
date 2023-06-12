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
  startAt: string;
  endAt: string;
};

type GroupTickets = PartActivity & {
  orderId: string;
  eventId: string;
  activityId: string;
  tickets: Ticket[];
};

interface TicketProps {
  userId: string;
  page: number;
  pageSize: number;
  isValid: boolean;
}

const getAllTickets = async ({
  userId,
  page = 1,
  pageSize = 10,
  isValid = true,
}: TicketProps) => {
  // query order by user_id
  const userFilter = { user_id: userId };

  const orders = await OrderModel.find(userFilter).populate<{
    activity_id: Activity;
  }>('activity_id', 'events');

  if (orders.length === 0)
    return {
      page,
      pageSize,
      totalCount: 0,
      totalPages: 1,
      tickets: [],
    };

  const _toISOString = (date: Date) => date.toISOString();
  const eventNumbers = orders.reduce<string[][]>((acc, order) => {
    const ids = order.activity_id.events
      .filter((e) =>
        isValid
          ? _toISOString(e.end_at) >= _toISOString(new Date())
          : _toISOString(e.end_at) < _toISOString(new Date()),
      )
      .map((e) => e.id);
    return [...acc, ...ids];
  }, []);

  // query tickets by order_id
  const tickets = await TicketModel.find({
    event_id: { $in: eventNumbers },
  }).populate<{ activity_id: Activity }>(
    'activity_id',
    'name address start_at end_at events',
  );

  const groupTickets = tickets.reduce<GroupTickets[]>((result, item) => {
    const activityId = item.activity_id._id;
    const orderId = item.order_id;
    const group = result.find(
      (g) =>
        String(orderId) === g.orderId && String(activityId) === g.activityId,
    );

    const ticket = {
      isShare: item.is_shared,
      isUsed: item.is_used,
      ticketNo: item.ticket_no,
      seat: `${item.row}排 ${item.seat}號`,
    };

    if (group) {
      group.tickets.push(ticket);
    } else {
      const targetEvent = item.activity_id.events.find(
        (event) => String(event._id) === String(item.event_id),
      );
      result.push({
        orderId: String(item.order_id),
        eventId: String(item.event_id),
        activityId: String(item.activity_id._id),
        name: item.activity_id.name,
        startAt: String(targetEvent?.start_at.toISOString()),
        endAt: String(targetEvent?.end_at.toISOString()),
        address: item.activity_id.address,
        tickets: [ticket],
      });
    }

    return result;
  }, []);

  // page
  const totalPages = Math.ceil(groupTickets.length / pageSize);
  const skipCount = (page - 1) * pageSize;
  const data = groupTickets.slice(skipCount * pageSize, pageSize);

  return {
    page,
    pageSize,
    totalCount: groupTickets.length,
    totalPages,
    tickets: data,
  };
};

export default getAllTickets;
