const ADDRESS_CODE = '420101';
const BANK_CARD_PREFIX = '622202';

const FAMILY_NAMES = Array.from(
  '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜',
);

const GIVEN_NAMES = Array.from(
  '子璇淼国栋夫瑞堂甜敏尚贤贺祥晨涛昊轩易辰益帆冉瑾春昆齐杨文东雄霖浩熙涵冰枫欣宜豪慧建政美淑杰源忠林榕润嘉新亦菲洁佳禹泽惠伟洋越丽翔晶莹苒溪雨怡毅琪蕊萌明远晨茜璐昊鑫君莎钰玉庆鸣语添雅清妍诗悦乐赫玥傲天',
);

const PHONE_PREFIXES = [
  '135',
  '136',
  '137',
  '138',
  '139',
  '150',
  '151',
  '152',
  '157',
  '158',
  '159',
  '182',
  '183',
  '187',
  '188',
  '198',
  '130',
  '131',
  '132',
  '155',
  '156',
  '186',
  '181',
  '189',
];

const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}

function randomDigits(length, random) {
  let value = '';

  for (let index = 0; index < length; index += 1) {
    value += Math.floor(random() * 10);
  }

  return value;
}

function calculateIdentityCheckCode(firstSeventeenDigits) {
  const total = Array.from(firstSeventeenDigits).reduce(
    (sum, digit, index) => sum + Number(digit) * ID_WEIGHTS[index],
    0,
  );

  return ID_CHECK_CODES[total % 11];
}

function generateIdentityNumber(random) {
  const year = 1960 + Math.floor(random() * 40);
  const month = String(1 + Math.floor(random() * 9)).padStart(2, '0');
  const day = String(10 + Math.floor(random() * 20)).padStart(2, '0');
  const sequence = randomDigits(3, random);
  const firstSeventeenDigits = `${ADDRESS_CODE}${year}${month}${day}${sequence}`;

  return `${firstSeventeenDigits}${calculateIdentityCheckCode(firstSeventeenDigits)}`;
}

export function generateIdentityRecord(random = Math.random) {
  return {
    name: `${pick(FAMILY_NAMES, random)}${pick(GIVEN_NAMES, random)}${pick(GIVEN_NAMES, random)}`,
    phone: `${pick(PHONE_PREFIXES, random)}${randomDigits(8, random)}`,
    idNumber: generateIdentityNumber(random),
    bankCard: `${BANK_CARD_PREFIX}${randomDigits(13, random)}`,
  };
}

export function generateIdentityBatch(count = 20, random = Math.random) {
  return Array.from(
    { length: count },
    () => generateIdentityRecord(random),
  );
}

export function isValidIdentityNumber(idNumber) {
  if (!/^\d{17}[\dX]$/.test(idNumber)) {
    return false;
  }

  return calculateIdentityCheckCode(idNumber.slice(0, 17)) === idNumber.slice(-1);
}
