import { createCipheriv, createDecipheriv, createHash } from 'crypto';

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

const checkingToken = {
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
    return JSON.parse(json);
  },
};

export default checkingToken;
