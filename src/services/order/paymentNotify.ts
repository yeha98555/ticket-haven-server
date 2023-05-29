import crypto from 'crypto';
import { StatusCode } from "@/enums/statusCode";
import { appError } from "../appError";
import OrderModel from '@/models/order';
import { OrderStatus } from '@/enums/orderStatus';

const { NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV } = process.env;

const createAesDecrypt = (tradeInfo: string) => {
  if (!NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
    throw appError(500, StatusCode.SERVER_ERROR, 'NEWEBPAY_HASH_KEY or NEWEBPAY_HASH_IV not found')
  }
  const decrypt = crypto.createDecipheriv('aes-256-cbc', NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV);
  decrypt.setAutoPadding(false);
  const text = decrypt.update(tradeInfo, 'hex', 'utf8');
  const plainText = text + decrypt.final('utf8');
  // const result = plainText.replace(/\x00|[\x01-\x20]+/g, '');
  const result = plainText.replace(/[\p{C}]+/gu, '');
  return JSON.parse(result);
}

const paymentNotify = async (tradeInfo: string) => {
  const info = createAesDecrypt(tradeInfo);

  // Ensure info.Result.Status is not undefined
  const status = info?.Status === 'SUCCESS' ? OrderStatus.PAID : OrderStatus.FAIL;

  // Find and update order status
  const order = await OrderModel.updateOne(
    { order_no: info.Result.MerchantOrderNo },
    { $set: { status: status } },
  );

  console.log(info);

  // TODO: Save the payment info to neweb_paymethods
  // info.Result.PayTime
  // info.Result.PaymentType
  // info.Result.IP

  return true;
};

export default paymentNotify;
