export function decryptLlgStrPhone(data) {
  let sum = 0;
  const digitReg = /^(\d)$/;
  const chars = data.toString().split('');

  for (let i = 0; i < chars.length; i++) {
    let value = chars[i];
    if (!digitReg.test(value)) {
      value = value.toLowerCase().charCodeAt(0) - 87;
    }
    sum += value * Math.pow(32, chars.length - i - 1);
  }

  return (sum - 5) / 3;
}
