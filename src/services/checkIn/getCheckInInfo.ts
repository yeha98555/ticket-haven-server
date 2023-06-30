import ActivityModel from '@/models/activity';
import checkInToken from './checkInToken';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { ConflictException } from '@/exceptions/Conflict';
import TicketModel from '@/models/ticket';
import { User } from '@/models/user';

const getCheckInInfo = async (inspectorToken: string, ticketToken: string) => {
  const activity = await ActivityModel.findOne({})
    .where('events.qrcode_verify_id')
    .equals(inspectorToken);

  const event = activity?.events.find(
    (e) => e.qrcode_verify_id === inspectorToken,
  );

  if (!activity || !event) throw new NotFoundException();

  const tokenPayload = checkInToken.verify(ticketToken);

  if (!tokenPayload) throw new ConflictException();

  const { ticketNo } = tokenPayload;

  const ticket = await TicketModel.findOne({
    event_id: event._id,
    ticket_no: ticketNo,
  }).populate<{ user_id: User }>('user_id');

  if (!ticket) throw new NotFoundException();

  const user = ticket.user_id;
  const subarea = activity.areas
    .flatMap((a) => a.subareas)
    .find((sa) => sa._id?.equals(ticket.subarea_id));

  return {
    user: {
      name: user?.username,
      email: user?.email,
    },
    activityName: activity.name,
    ticketNo: ticket.ticket_no,
    subAreaName: subarea?.name,
    row: ticket.row,
    seat: ticket.seat,
    isUsed: ticket.is_used,
  };
};

export default getCheckInInfo;
