import ActivityModel from '@/models/activity';
import checkInToken from './checkInToken';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { ConflictException } from '@/exceptions/Conflict';
import TicketModel from '@/models/ticket';
import { Order } from '@/models/order';
import UserModel from '@/models/user';

const getCheckInInfo = async (inspectorToken: string, ticketToken: string) => {
  const activity = await ActivityModel.findOne({})
    .where('events.qrcode_verify_link')
    .equals(inspectorToken);

  const event = activity?.events.find(
    (e) => e.qrcode_verify_link === inspectorToken,
  );

  if (!activity || !event) throw new NotFoundException();

  const tokenPayload = checkInToken.verify(ticketToken);

  if (!tokenPayload) throw new ConflictException();

  const { ticketNo } = tokenPayload;

  const ticket = await TicketModel.findOne({
    event_id: event._id,
    ticket_no: ticketNo,
  }).populate<{ order_id: Order }>('order_id');

  if (!ticket) throw new NotFoundException();

  const user = await UserModel.findById(ticket.order_id.user_id);

  return {
    user: {
      name: user?.username,
      email: user?.email,
    },
    activityName: activity.name,
    ticketNo: ticket.ticket_no,
    row: ticket.row,
    seat: ticket.seat,
    isUsed: ticket.is_used,
  };
};

export default getCheckInInfo;
