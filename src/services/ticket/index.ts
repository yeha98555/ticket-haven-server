import createTicketNo from './createTicketNo';
import getAllTickets from './getAllTickets';
import checkingToken from './checkingToken';

const ticketService = {
  getAllTickets,
  createTicketNo,
  createTicketCode: checkingToken.create,
  decodeTicketCode: checkingToken.decode,
};

export default ticketService;
