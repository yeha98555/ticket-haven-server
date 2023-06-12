import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { add, isAfter } from 'date-fns';

const algorithm = 'aes-192-cbc';
const keyLength = 24;

const key = (() => {
  const hash = createHash('sha256');
  return hash
    .update(process.env.TICKET_CHECKING_KEY)
    .digest('base64')
    .substring(0, keyLength);
})();

const iv = (() => {
  const hash = createHash('sha256');
  return hash
    .update(process.env.TICKET_CHECKING_IV)
    .digest('base64')
    .substring(0, 16);
})();

const encrypt = (text: string) => {
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encrypted: string) => {
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export interface CheckInTokenPayload {
  ticketNo: string;
  timestamp: number;
}

const checkInToken = {
  create(ticketNo: string) {
    const payload = {
      ticketNo,
      timestamp: Date.now(),
    };

    const encrypted = encrypt(JSON.stringify(payload));
    return encrypted;
  },
  decode(token: string) {
    const json = decrypt(token);
    return JSON.parse(json) as CheckInTokenPayload;
  },
  verify(token: string) {
    let tokenPayload: CheckInTokenPayload;
    try {
      tokenPayload = this.decode(token);
    } catch (error) {
      return false;
    }

    const { timestamp } = tokenPayload;

    const expireTime = add(new Date(timestamp), {
      minutes: 15,
    });
    const isExpired = isAfter(new Date(), expireTime);

    if (isExpired) return false;

    return tokenPayload;
  },
};

export default checkInToken;
