import CryptoJS from 'crypto-js';

const DEFAULT_UTO_KEY = 'DD1Eovf4QTWRWqpT0o5fQzvunrR49jvL';
const DEFAULT_UTO_IV = '6ab0233544af9e55';

export function utoDecrypt(data, key = DEFAULT_UTO_KEY, iv = DEFAULT_UTO_IV) {
  try {
    if (!data || !key) {
      return '';
    }

    const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch {
    return '';
  }
}
