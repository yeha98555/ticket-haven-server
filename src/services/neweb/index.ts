import crypto from 'crypto';

type NewebPayPaymentRequest = {
  // MerchantID: string;
  // RespondType: 'JSON' | 'String';
  TimeStamp: number;
  Version: number;
  MerchantOrderNo: string;
  Amt: number;
  ItemDesc: string;
} & { [key: string]: string | number };

class NewebService {
  readonly hashKey: string;
  readonly hashIv: string;
  readonly merchantId: string;
  readonly RespondType: string = 'JSON';

  constructor({
    hashKey,
    hashIv,
    merchantId,
  }: {
    hashKey: string;
    hashIv: string;
    merchantId: string;
  }) {
    this.hashKey = hashKey;
    this.hashIv = hashIv;
    this.merchantId = merchantId;
  }

  encrypt(tradeInfoData: NewebPayPaymentRequest) {
    const tradeInfo = this.#createAesEncrypt({
      ...tradeInfoData,
      RespondType: this.RespondType,
      MerchantID: this.merchantId,
    });
    const tradeSha = this.#createShaEncrypt(tradeInfo);

    return {
      tradeInfo,
      tradeSha,
    };
  }

  decrypt(returnToken: string) {
    const decrypt = crypto.createDecipheriv(
      'aes-256-cbc',
      this.hashKey,
      this.hashIv,
    );
    decrypt.setAutoPadding(false);
    const text = decrypt.update(returnToken, 'hex', 'utf8');
    const plainText = text + decrypt.final('utf8');
    const result = plainText.replace(/[\p{C}]+/gu, '');
    return JSON.parse(result);
  }

  #createAesEncrypt(tradeInfo: NewebPayPaymentRequest) {
    const encrypt = crypto.createCipheriv(
      'aes-256-cbc',
      this.hashKey,
      this.hashIv,
    );
    const encrypted =
      encrypt.update(this.#genDataChain(tradeInfo), 'utf8', 'hex') +
      encrypt.final('hex');
    return encrypted;
  }

  #createShaEncrypt(aesEncrypt: string) {
    const sha = crypto.createHash('sha256');
    const plainText = `HashKey=${this.hashKey}&${aesEncrypt}&HashIV=${this.hashIv}`;
    return sha.update(plainText).digest('hex').toUpperCase();
  }

  #genDataChain(paymentData: NewebPayPaymentRequest) {
    const params = new URLSearchParams();

    Object.entries(paymentData).forEach(([key, value]) =>
      params.append(key, value.toString()),
    );

    return params.toString();
  }
}

const { NEWEBPAY_MERCHANT_ID, NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV } =
  process.env;
const newebService = new NewebService({
  hashKey: NEWEBPAY_HASH_KEY,
  hashIv: NEWEBPAY_HASH_IV,
  merchantId: NEWEBPAY_MERCHANT_ID,
});

export default newebService;
