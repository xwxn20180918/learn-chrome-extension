import CryptoJS from 'crypto-js';

const DEFAULT_OMCTX_KEY = 'RNF2uIWCrz2CttJ7D8vjLRwRoGiYmmWx';

export function omctxDecrypt(data, key = DEFAULT_OMCTX_KEY) {
  try {
    if (!data || !key) {
      return '';
    }

    const normalizedData = data.replaceAll('\\/', '/');
    const decrypted = CryptoJS.AES.decrypt(
      normalizedData,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(''),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    ).toString(CryptoJS.enc.Utf8);

    return decodeURIComponent(decrypted);
  } catch {
    return '';
  }
}

export function formatOmctxOutput(data) {
  if (!data || !data.includes('=')) {
    return {
      content: data || '',
      isJSON: false,
    };
  }

  return {
    content: JSON.stringify(Object.fromEntries(new URLSearchParams(data))),
    isJSON: true,
  };
}
