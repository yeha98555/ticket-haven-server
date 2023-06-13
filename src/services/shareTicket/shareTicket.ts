import { add } from 'date-fns';
import TicketModel from '@/models/ticket';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { Types } from 'mongoose';

export const exchangeTicket = async (
  userId: string,
  ticketNo: string,
  shareCode: string,
) => {
  const ticket = await TicketModel.findOne({
    ticket_no: ticketNo,
    share_code: shareCode,
    share_code_create_at: { $gte: add(new Date(), { minutes: -15 }) },
    user_id: { $ne: new Types.ObjectId(userId) },
  });

  if (!ticket) throw new NotFoundException();

  ticket.shared_by = ticket.user_id;
  ticket.user_id = new Types.ObjectId(userId);
  ticket.share_code = '';
  ticket.share_code_create_at = undefined;

  await ticket.save();

  return true;
};
