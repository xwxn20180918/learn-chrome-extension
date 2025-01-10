// 这是一个在后台执行的文件，多个tab会共享此文件
// 这个文件会随着插件安装执行一次
// 在该文件内存储的数据，会被多tab页面共享
// 在v3版本中，只有js脚本，没有对应的html页面
// 由于此文件在后台执行，为了测试需要，将数据通过消息发送出去
let namespaced = 'BACKGROUND HELLO~~~~';

// 在插件安装完成之后，执行这样一个代码。相当于插件内部就存储了一个颜色。
chrome.runtime.onInstalled.addListener(async () => {
  console.log('background js');
  // 1. Create a new tab
  // chrome.tabs.create(
  //   {
  //     url: chrome.runtime.getURL('newPage.html'),
  //   }
  // );

  // 2. 查询所有tab
  const tabs = await chrome.tabs.query({
    url: [
      'https://blog.csdn.net/*',
      'https://juejin.cn/post/*',
    ],
  });
  // console.log(tabs)
  tabs &&
  tabs.forEach((tab) => {
    // console.log(tab, 'background js tab');
  });

  // 3. 接收到content的消息后，通过 sendResponse将namespaced数据发送出去
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //  A page requested user data, respond with a copy of `user`
    if (message === 'get-user-data') {
      sendResponse(namespaced);
    }
  });

  // XXX. service worker 通过 chrome.tabs.sendMessage 发送消息，一直未成功 XXX
  /* (async () => {
    // 查询当前tab
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    // 和当前tab进行通信
    chrome.tabs.sendMessage(
      tab.id,
      {
        greeting: 'hello',
      },
      function (response) {
        console.log('background 发送消息', response, tab.id);
        // do something with response here, not outside the function
        console.log(response, 'background js: ');
      }
    );
  })(); */

  // 可以设置数据到storage中， 可以将数据设置storage中进行传递
  chrome.storage.sync.set({namespaced: 'run background js storage'});
});

// function firstTest(sendResponse) {
//   sendResponse({
//     message: 'test'
//   });
// }
//
// chrome.runtime.onMessageExternal.addListener(
//   (request, sender, sendResponse) => {
//     console.log(request, sender, sendResponse, '11111111111111111')
//     if (request.type === 'test') {
//       console.log(11222)
//       return firstTest(sendResponse);
//     }
//   });
