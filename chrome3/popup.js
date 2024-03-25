console.log(document.getElementById('clickBtn'));
document.getElementById('clickBtn').addEventListener('click', function () {
  console.log('clicked');
});

// 接收消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, payload } = request;
  console.log(request, 'popup got');
  sendResponse('popup got!');
});
// 接收 storage 中的数据
chrome.storage.sync.get({ namespaced: 'aaa' }, (data) => {
  console.log(data, 'namespaced from background js');
});

// popup 通过 chrome.tabs.sendMessage 发送消息，
// content接收到content的消息后，通过 sendResponse将 greeting 数据发送出去
(async () => {
  // 查询当前tab
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  // 和当前tab进行通信， 可以接收到content.js文件第31行的返回数据
  const response = await chrome.tabs.sendMessage(tab.id, {
    greeting: 'hello',
  });
  // do something with response here, not outside the function
  console.log(response, "popup response");
})();

