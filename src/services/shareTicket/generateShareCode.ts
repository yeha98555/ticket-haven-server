import { add, isAfter } from 'date-fns';
import { ConflictException } from '@/exceptions/Conflict';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { Order } from '@/models/order';
import TicketModel from '@/models/ticket';
import { randomString } from '@/utils/makeId';

export const generateShareCode = async (userId: string, ticketNo: string) => {
  const ticket = await TicketModel.findOne({})
    .byNo(ticketNo)
    .populate<{ order_id: Order }>('order_id');

  if (!ticket || !ticket.order_id.user_id.equals(userId))
    throw new NotFoundException();

  if (!ticket.order_id._id.equals(ticket.original_order_id) || ticket.is_used)
    throw new ConflictException();

  if (ticket.share_code_create_at) {
    const isExpire = isAfter(
      new Date(),
      add(ticket.share_code_create_at, { minutes: 15 }),
    );

    if (!isExpire)
      return {
        shareCode: ticket.share_code,
        createAt: ticket.share_code_create_at,
      };
  }

  const shareCode = randomString(8);

  ticket.share_code = shareCode;
  ticket.share_code_create_at = new Date();

  await ticket.save();

  return {
    shareCode,
    createAt: ticket.share_code_create_at,
  };
};
