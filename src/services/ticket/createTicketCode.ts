import TicketModel from '@/models/ticket';
import checkingToken from './checkingToken';
import { NotFoundException } from '@/exceptions/NotFoundException';

const createTicketCode = async (userId: string, ticketNo: string) => {
  const ticket = await TicketModel.findOne({
    ticket_no: ticketNo,
    user_id: userId,
  }).select(['_id', 'token']);

  if (!ticket) throw new NotFoundException();

  // TODO: check status (is used or not)

  // Create token
  const token = checkingToken.create(ticketNo);

  // Save to database
  const ticketUpdated = await TicketModel.findByIdAndUpdate(
    ticket._id,
    { token: token },
    {
      runValidators: true,
    },
  ).select(['token']);

  return {
    token: ticketUpdated?.token,
  };
};

export default createTicketCode;
