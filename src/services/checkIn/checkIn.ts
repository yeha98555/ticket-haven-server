import { NotFoundException } from '@/exceptions/NotFoundException';
import ActivityModel from '@/models/activity';
import checkInToken from './checkInToken';
import { ConflictException } from '@/exceptions/Conflict';
import TicketModel from '@/models/ticket';

const checkIn = async (inspectorToken: string, ticketToken: string) => {
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

  const ticket = await TicketModel.findOneAndUpdate(
    {
      event_id: event._id,
      ticket_no: ticketNo,
    },
    { is_used: true },
    { runValidators: true, new: true },
  );

  if (!ticket) throw new NotFoundException();

  return ticket.is_used;
};

export default checkIn;
