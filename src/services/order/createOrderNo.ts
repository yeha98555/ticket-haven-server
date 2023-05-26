import { format } from 'date-fns';
import { Types } from 'mongoose';

const createOrderNo = (id: string | Types.ObjectId, date: Date) => {
  const lastSix = id.toString().slice(-6);
  return `${format(date, 'yyyyMMdd')}${lastSix}`;
};

export default createOrderNo;
