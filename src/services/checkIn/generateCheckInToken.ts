import TicketModel from '@/models/ticket';
import checkInToken from './checkInToken';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { ConflictException } from '@/exceptions/Conflict';

const generateCheckInToken = async (userId: string, ticketNo: string) => {
  const ticket = await TicketModel.findOne({
    ticket_no: ticketNo,
    user_id: userId,
  }).select(['_id', 'token', 'is_used']);

  if (!ticket) throw new NotFoundException();

  if (ticket.is_used) throw new ConflictException('票卷已使用');

  // Create token
  const token = checkInToken.create(ticketNo);

  // Save to database
  ticket.token = token;
  await ticket.save();

  return token;
};

export default generateCheckInToken;
