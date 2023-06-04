import { getUnixTime, add } from 'date-fns';
import { aesEncrypt } from '@/utils/aesCrypt';

const createTicketCode = (
  ticketNo: string,
) => {
  const validDate = getUnixTime(add(new Date(), {minutes: 10}));
  const code = aesEncrypt(`${validDate}-${ticketNo}`, process.env.TICKET_SECRET);
  return code;
};

export default createTicketCode;
