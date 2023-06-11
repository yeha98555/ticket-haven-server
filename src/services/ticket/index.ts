import createTicketNo from './createTicketNo';
import getAllTickets from './getAllTickets';
import createTicketCode from './createTicketCode';
import { generateSharedCode } from './generateSharedCode';

const ticketService = {
  getAllTickets,
  createTicketNo,
  createTicketCode,
  generateSharedCode,
};

export default ticketService;
