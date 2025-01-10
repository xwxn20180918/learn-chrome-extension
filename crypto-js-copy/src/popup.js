console.log(document.getElementById('clickBtn'));
import CryptoJS from 'crypto-js';

const llgIv = 'yZM2mn0akhcq4VQK';
const llgSecret = 'KEYTphIWNO1D9LfMsHoi0by3AZcR5tvu';

function llgEncrypt(str) {
  const result = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(llgSecret), {
    iv: CryptoJS.enc.Utf8.parse(llgIv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return result + '';
}

function llgDecrypt(str) {
  if (str === null) return '';
  return CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(llgSecret), {
    iv: CryptoJS.enc.Utf8.parse(llgIv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
}

const ytSecret = CryptoJS.enc.Base64.parse(
  'BY6FRfeRiaFlMWFb6ozu3FIIp0m6sR/ay/5+075xkFY='
);

function ytEncrypt(data) {
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const ivString = iv.toString(CryptoJS.enc.Base64);
  const value = CryptoJS.AES.encrypt(data, ytSecret, {
    iv
  }).toString();
  const mac = CryptoJS.HmacSHA256(
    `${ivString}${value}`,
    ytSecret
  ).toString();

  return btoa(JSON.stringify({
    iv: ivString,
    mac,
    value,
    tag: ''
  }));
}

function ytDecrypt(str) {
  const encrypted = JSON.parse(atob(str));

  return CryptoJS.AES.decrypt(encrypted.value, ytSecret, {
    iv: CryptoJS.enc.Base64.parse(encrypted.iv)
  }).toString(CryptoJS.enc.Utf8);
}

let currentTab;
document.getElementById('llgEncrypt').addEventListener('click', async function () {
  const outputText = document.getElementById('outputText');
  const element = document.getElementById('inputText');
  outputText.textContent = llgEncrypt(JSON.stringify(element.value));
});

document.getElementById('llgDecrypt').addEventListener('click', async function () {
  const outputText = document.getElementById('outputText');
  const element = document.getElementById('inputText');
  outputText.textContent = llgDecrypt(element.value);
});

document.getElementById('ytEncrypt').addEventListener('click', async function () {
  const outputText = document.getElementById('outputText');
  const element = document.getElementById('inputText');
  outputText.textContent = ytEncrypt(JSON.stringify(element.value));
});

document.getElementById('ytDecrypt').addEventListener('click', async function () {
  const outputText = document.getElementById('outputText');
  const element = document.getElementById('inputText');
  outputText.textContent = ytDecrypt(element.value);
  console.log(outputText.textContent, 'outputText.textContent')
});

// 接收消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {action, payload} = request;
  console.log(request, 'popup got');
  sendResponse('popup got!');
});
// 接收 storage 中的数据
chrome.storage.sync.get({namespaced: 'aaa'}, (data) => {
  console.log(data, 'namespaced from background js');
});

// popup 通过 chrome.tabs.sendMessage 发送消息，
// content接收到content的消息后，通过 sendResponse将 greeting 数据发送出去
(async () => {
  // 查询当前tab
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
    currentWindow: true
  });
  currentTab = tab;
  // 和当前tab进行通信， 可以接收到content.js文件第31行的返回数据
  // const response = await chrome.tabs.sendMessage(tab.id, {
  //   greeting: 'hello',
  // });
  // do something with response here, not outside the function
  // console.log(response, "popup response");
})();

