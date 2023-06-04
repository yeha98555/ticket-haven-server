import { scrypt, randomFill, createCipheriv } from "crypto"

const algorithm = 'aes-192-cbc';
const keyLength = 24;

export const aesEncrypt = (data: string, salt: string) => {
  return new Promise((resolve, reject)=>{
    scrypt(data, salt, keyLength, (err, key)=> {
      if(err) reject(err);
      randomFill(new Uint8Array(16), (err, iv)=>{
        if(err) reject(err);
        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = '';
        cipher.setEncoding('hex');
        cipher.on('data', (chunk)=> encrypted += chunk);
        cipher.on('end', () => console.log(encrypted));

        cipher.write('finished encrypt');
        cipher.end();
        resolve(encrypted);
      })
    });
  });
}
