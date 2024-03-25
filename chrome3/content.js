console.log('content.js hello everybody!');

let newDiv = document.createElement('div');
newDiv.innerHTML = 'hello everybody!';
newDiv.id = 'newDiv';
document.body.appendChild(newDiv);

chrome.runtime.sendMessage('get-user-data', (response) => {
  // 3. Got an asynchronous response with the data from the service worker
  console.log('received user data', response);
  //   initializeUI(response);
  newDiv.innerHTML = response;
});
chrome.storage.sync.get({ namespaced: 'aaa' }, (data) => {
  console.log(data, 'namespaced from background js');
});


// 接收消息，可以根据 message类型，进行不同的sendResponse操作
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message === 'set-data-popup') {
    sendResponse('set msg from content');
  }
  // 接收这条消息是 popup 通过 chrome.tabs.sendMessage 发送的
  console.log(
    sender.tab
      ? 'from a content script:' + sender.tab.url
      : 'from the extension'
  );
  console.log(message, sender, 'content script 接收消息');
  if (message.greeting === 'hello') sendResponse({ farewell: 'goodbye' });
  sendResponse({ greeting: 'otherAll' });
});

