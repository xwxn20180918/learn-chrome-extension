console.log('content.js hello everybody!');


// let newDiv = document.createElement('div');
// newDiv.innerHTML = `<div id="wrapper">
//   <h3>消消气</h3>
//   <div><button id="cancel">已消气</button>
//   <button id="reject">不原谅</button></div>
// </div>`;
// newDiv.id = 'newDiv';
// document.body.appendChild(newDiv);
// const cancelBtn = document.querySelector('#cancel');
// const rejectBtn = document.querySelector('#reject');
// cancelBtn.onclick = function() {
//   document.body.removeChild(newDiv);
//   chrome.storage.sync.set({ state: 'cancel' }, (data) => {
//   });
// }
function seatSize() {
  var w = Math.random() * document.documentElement.clientWidth;
  var h = Math.random() * document.documentElement.clientHeight;
  var x = Math.random() * (document.documentElement.clientWidth - w);
  var y = Math.random() * (document.documentElement.clientHeight - h);
  return {
    left: x,
    top: y,
    width: w,
    height: h
  };
}
// rejectBtn.onclick = function() {
//   newDiv.style.bottom = Math.random() * 600 + 10 + "px";
//   newDiv.style.right = Math.random() * 1200 + 10 + "px";
// }
// chrome.storage.sync.get({ state: '' }, (data) => {
//   if (data.state === 'cancel') {
//     document.body.removeChild(newDiv);
//   }
// });

chrome.runtime.sendMessage('get-user-data', (response) => {
  // 3. Got an asynchronous response with the data from the service worker
  // console.log('received user data', response);
  return response;
  //   initializeUI(response);
  // newDiv.innerHTML = response;
});
chrome.storage.sync.get({ namespaced: 'aaa' }, (data) => {
  // console.log(data, 'namespaced from background js');
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
  if (message.greeting === 'hello') {
    console.log(document, '111111111111')
    let element = document.querySelector('.aside ul');
    console.log(element, 'element');
    if (element) {
      let attribute = element.getAttribute('routes');
      console.log(attribute, 'artibute');
    }
    sendResponse({ farewell: 'goodbye' })
  } else {
    sendResponse({ greeting: 'otherAll' });
  }
});

