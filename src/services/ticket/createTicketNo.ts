import { format } from 'date-fns';
import { Types } from 'mongoose';

const createTicketNo = (
  id: string | Types.ObjectId,
  date: Date,
  row: number | string,
  seat: number | string,
) => {
  const lastSix = id.toString().slice(-6);
  return `${format(date, 'yyyyMMdd')}${row.toString().padStart(2, '0')}${seat
    .toString()
    .padStart(2, '0')}${lastSix}`;
};

export default createTicketNo;
