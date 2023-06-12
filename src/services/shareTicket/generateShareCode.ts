import { add, isAfter } from 'date-fns';
import { ConflictException } from '@/exceptions/Conflict';
import { NotFoundException } from '@/exceptions/NotFoundException';
import TicketModel from '@/models/ticket';
import { randomString } from '@/utils/makeId';

const shareCodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateShareCode = async (userId: string, ticketNo: string) => {
  const ticket = await TicketModel.findOne({ user_id: userId }).byNo(ticketNo);

  if (!ticket) throw new NotFoundException();
  if (ticket.is_shared || ticket.is_used) throw new ConflictException();

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

  const shareCode = randomString(8, shareCodeChars);

  ticket.share_code = shareCode;
  ticket.share_code_create_at = new Date();

  await ticket.save();

  return {
    shareCode,
    createAt: ticket.share_code_create_at,
  };
};
