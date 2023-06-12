import TicketModel from '@/models/ticket';

export const shareTicket = async (
  userId: string,
  ticketNo: string,
  shareCode: string,
) => {
  const ticket = await TicketModel.findOne({ share_code: shareCode }).byNo(
    ticketNo,
  );
  return false;
};
