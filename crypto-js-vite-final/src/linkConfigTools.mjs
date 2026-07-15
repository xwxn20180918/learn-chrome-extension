export const MACRO_PARAM_KEYS = ['adv_id', 'plan_id', 'click_id'];

export const LINK_PREFIX_OPTIONS = [
  'https://card-web-test.zonelian.com',
  'http://xw.beta.zonelian.com',
  'http://hwn.beta.zonelian.com',
  'http://lsp.beta.zonelian.com',
  'http://delivery.lcw.zonelian.com:1383',
  'http://xw-api.zonelian.com:5030',
  'http://delivery.zonelian.com:5117',
  'https://f.rk82.cn',
];

function parseUrl(url) {
  try {
    return new URL(url);
  } catch {
    throw new Error('请输入有效的链接地址');
  }
}

function createSixDigitNumber() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function replaceMacroParams(url) {
  const parsed = parseUrl(url);
  let hasReplacement = false;

  MACRO_PARAM_KEYS.forEach((key) => {
    if (parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, createSixDigitNumber());
      hasReplacement = true;
    }
  });

  return hasReplacement ? parsed.toString() : url;
}

export function parseManualParams(paramsText) {
  if (!paramsText || !paramsText.trim()) {
    return [];
  }

  return paramsText
    .trim()
    .replace(/^\?/, '')
    .split(/[\n&]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex === -1) {
        return { key: item.trim(), value: '' };
      }

      return {
        key: item.slice(0, separatorIndex).trim(),
        value: item.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((param) => param.key);
}

export function applyManualParams(url, paramsText) {
  const parsed = parseUrl(url);
  const params = parseManualParams(paramsText);

  params.forEach(({ key, value }) => {
    parsed.searchParams.set(key, value);
  });

  return parsed.toString();
}

export function replaceUrlPrefix(url, prefix) {
  const parsed = parseUrl(url);
  const parsedPrefix = parseUrl(prefix);

  parsed.protocol = parsedPrefix.protocol;
  parsed.host = parsedPrefix.host;

  return parsed.toString();
}

export function parseLandingUrl(url) {
  const parsed = parseUrl(url);
  const params = [];

  parsed.searchParams.forEach((value, key) => {
    params.push({
      key,
      value,
    });
  });

  return {
    href: parsed.href,
    origin: parsed.origin,
    protocol: parsed.protocol,
    host: parsed.host,
    path: parsed.pathname,
    hash: parsed.hash,
    params,
  };
}
