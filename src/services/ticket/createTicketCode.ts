import TicketModel from '@/models/ticket';
import checkingToken from './checkingToken';
import { NotFoundException } from '@/exceptions/NotFoundException';

const createTicketCode = async (userId: string, ticketNo: string) => {
  const ticket = await TicketModel.findOne({
    ticket_no: ticketNo,
    user_id: userId,
  });

  if (!ticket) throw new NotFoundException();

  // TODO: check status (is used or not)

  // Create token
  const token = checkingToken.create(ticketNo);

  // Save to database
  await TicketModel.updateOne(
    {
      ticket_no: ticketNo,
      user_id: userId,
    },
    {
      token: token,
    },
    {
      runValidators: true,
    },
  );

  return token;
};

export default createTicketCode;
