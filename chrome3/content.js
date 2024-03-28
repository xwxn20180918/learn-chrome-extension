console.log('content.js hello everybody!');


let newDiv = document.createElement('div');
newDiv.innerHTML = `<div id="wrapper">
  <h3>小仙女～消消气</h3>
  <div><button id="cancel">已消气</button>
  <button id="reject">不原谅</button></div>
</div>`;
newDiv.id = 'newDiv';
document.body.appendChild(newDiv);
const cancelBtn = document.querySelector('#cancel');
const rejectBtn = document.querySelector('#reject');
cancelBtn.onclick = function() {
  document.body.removeChild(newDiv);
  chrome.storage.sync.set({ state: 'cancel' }, (data) => {
  });
}
rejectBtn.onclick = function() {
  newDiv.style.bottom = Math.random() * 200 + 10 + "px";
  newDiv.style.right = Math.random() * 800 + 10 + "px";
}
// chrome.storage.sync.get({ state: '' }, (data) => {
//   if (data.state === 'cancel') {
//     document.body.removeChild(newDiv);
//   }
// });

chrome.runtime.sendMessage('get-user-data', (response) => {
  // 3. Got an asynchronous response with the data from the service worker
  console.log('received user data', response);
  //   initializeUI(response);
  // newDiv.innerHTML = response;
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

