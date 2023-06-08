import TicketModel from '@/models/ticket';
import checkInToken from './checkInToken';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { ConflictException } from '@/exceptions/Conflict';
import { Order } from '@/models/order';
import UserModel from '@/models/user';

const generateCheckInToken = async (userId: string, ticketNo: string) => {
  const ticket = await TicketModel.findOne({
    ticket_no: ticketNo,
  }).populate<{ order_id: Order }>('order_id');

  const isOwner = await UserModel.findById(ticket?.order_id.user_id);

  if (!ticket || !isOwner) throw new NotFoundException();

  if (ticket.is_used) throw new ConflictException('票卷已使用');

  // Create token
  const token = checkInToken.create(ticketNo);

  // Save to database
  ticket.token = token;
  await ticket.save();

  return token;
};

export default generateCheckInToken;
