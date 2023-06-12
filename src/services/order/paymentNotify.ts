import crypto from 'crypto';
import { StatusCode } from '@/enums/statusCode';
import { appError } from '../appError';
import OrderModel from '@/models/order';
import { OrderStatus } from '@/enums/orderStatus';
import SeatReservationModel from '@/models/seatReservation';
import TicketModel from '@/models/ticket';
import { Types } from 'mongoose';
import createTicketNo from '../ticket/createTicketNo';
import ActivityModel from '@/models/activity';

const { NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV } = process.env;

const createAesDecrypt = (tradeInfo: string) => {
  if (!NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
    throw appError(
      500,
      StatusCode.SERVER_ERROR,
      'NEWEBPAY_HASH_KEY or NEWEBPAY_HASH_IV not found',
    );
  }
  const decrypt = crypto.createDecipheriv(
    'aes-256-cbc',
    NEWEBPAY_HASH_KEY,
    NEWEBPAY_HASH_IV,
  );
  decrypt.setAutoPadding(false);
  const text = decrypt.update(tradeInfo, 'hex', 'utf8');
  const plainText = text + decrypt.final('utf8');
  // const result = plainText.replace(/\x00|[\x01-\x20]+/g, '');
  const result = plainText.replace(/[\p{C}]+/gu, '');
  return JSON.parse(result);
};

const paymentNotify = async (tradeInfo: string) => {
  const info = createAesDecrypt(tradeInfo);

  // Ensure info.Result.Status is not undefined
  const status =
    info.Status === 'SUCCESS' ? OrderStatus.SUCCESS : OrderStatus.TEMP;

  const order = await OrderModel.findOne({}).byNo(info.Result.MerchantOrderNo);

  const seatReservation = await SeatReservationModel.findById(
    order?.seat_reservation_id,
  );
  const seats = seatReservation?.seats;

  const activity = await ActivityModel.findById(order?.activity_id);

  const date = new Date();

  await TicketModel.insertMany(
    seats?.map((s) => {
      const ticketId = new Types.ObjectId();
      const price = activity?.areas.find((a) =>
        a._id?.equals(s.area_id),
      )?.price;
      return {
        _id: ticketId,
        ticket_no: createTicketNo(ticketId, date, s.row, s.seat),
        order_id: order?._id,
        activity_id: order?.activity_id,
        event_id: order?.event_id,
        area_id: s.area_id,
        subarea_id: s.subarea_id,
        row: s.row,
        seat: s.seat,
        price,
      };
    }),
  );

  await seatReservation?.deleteOne();

  order!.status = status;
  order!.seat_reservation_id = undefined;

  await order?.save();

  // TODO: Save the payment info to neweb_paymethods
  // info.Result.PayTime
  // info.Result.PaymentType
  // info.Result.IP

  return true;
};

export default paymentNotify;
