import crypto from 'crypto';
import { NotFoundException } from '@/exceptions/NotFoundException';
import { Activity } from '@/models/activity';
import OrderModel from '@/models/order';
import { User } from '@/models/user';
import { appError } from '../appError';
import { StatusCode } from '@/enums/statusCode';
import SeatReservationModel from '@/models/seatReservation';
import { OrderStatus } from '@/enums/orderStatus';
import { OrderCannotModifyException } from '@/exceptions/OrderCannotModify';

const RespondType = 'JSON';
const LimitTime = 300;  // 5 minutes
const {
  NEWEBPAY_VERSION,
  NEWEBPAY_MERCHANT_ID,
  NEWEBPAY_HASH_KEY,
  NEWEBPAY_HASH_IV,
  NEWEBPAY_RETURN_URL,
  NEWEBPAY_NOTIFY_URL,
} = process.env;

interface NewebPayPaymentRequest {
  MerchantOrderNo: string;
  RespondType: string;
  TimeStamp: number;
  Email: string;
  Amt: number;
  ItemDesc: string;
}

const formatDesc = (name: string, quantity: number, start_at: Date) => {
  const formattedName = name.length > 35 ? name.slice(0, 32) + '...' : name;
  const formattedDate = new Date(start_at).toISOString().slice(0, 10);
  return `${formattedName} ${quantity} 張 [${formattedDate}]`;
};

const genDataChain = (paymentData: NewebPayPaymentRequest) => {
  return `MerchantID=${NEWEBPAY_MERCHANT_ID}&RespondType=${RespondType}&TradeLimit=${LimitTime}&TimeStamp=${paymentData.TimeStamp
    }&Version=${NEWEBPAY_VERSION}&MerchantOrderNo=${paymentData.MerchantOrderNo
    }&Amt=${paymentData.Amt}&ItemDesc=${encodeURIComponent(
      paymentData.ItemDesc,
    ).replace(/%20/g, '+')}&Email=${encodeURIComponent(
      paymentData.Email,
    )}&ReturnURL=${NEWEBPAY_RETURN_URL}&NotifyURL=${NEWEBPAY_NOTIFY_URL}`;
};

const createAesEncrypt = (tradeInfo: NewebPayPaymentRequest) => {
  if (!NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
    throw appError(
      500,
      StatusCode.SERVER_ERROR,
      'NEWEBPAY_HASH_KEY or NEWEBPAY_HASH_IV not found',
    );
  }
  const encrypt = crypto.createCipheriv(
    'aes-256-cbc',
    NEWEBPAY_HASH_KEY,
    NEWEBPAY_HASH_IV,
  );
  const encrypted =
    encrypt.update(genDataChain(tradeInfo), 'utf8', 'hex') +
    encrypt.final('hex');
  return encrypted;
};

const createShaEncrypt = (aesEncrypt: string) => {
  if (!NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
    throw appError(
      500,
      StatusCode.SERVER_ERROR,
      'NEWEBPAY_HASH_KEY or NEWEBPAY_HASH_IV not found',
    );
  }
  const sha = crypto.createHash('sha256');
  const plainText = `HashKey=${NEWEBPAY_HASH_KEY}&${aesEncrypt}&HashIV=${NEWEBPAY_HASH_IV}`;
  return sha.update(plainText).digest('hex').toUpperCase();
};

const payment = async (userId: string, orderNo: string) => {
  const order = await OrderModel.findOne({
    order_no: orderNo,
    user_id: userId,
  })
    .populate<{ user_id: User }>('user_id', 'email')
    .populate<{ activity_id: Activity }>('activity_id', 'name start_at');

  if (!order) throw new NotFoundException();
  if (order.status !== OrderStatus.PENDING)
    throw new OrderCannotModifyException();

  // Calculate the number of tickets
  const seatReservation = await SeatReservationModel.findById(
    order.seat_reservation_id,
  );

  const ticketCount = seatReservation!.seats.length;

  const paymentData = {
    MerchantOrderNo: order.order_no,
    RespondType: RespondType,
    TimeStamp: Math.floor(Date.now() / 1000),
    Email: order.user_id.email,
    Amt: order.price,
    Version: NEWEBPAY_VERSION,
    ItemDesc: formatDesc(
      order.activity_id.name,
      ticketCount,
      order.activity_id.start_at,
    ),
  };

  const aesEncrypt = createAesEncrypt(paymentData);
  const shaEncrypt = createShaEncrypt(aesEncrypt);

  return {
    ...paymentData,
    MerchantID: NEWEBPAY_MERCHANT_ID,
    TradeInfo: aesEncrypt,
    TradeSha: shaEncrypt,
  };
};

export default payment;
