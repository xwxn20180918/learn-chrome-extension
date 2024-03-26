console.log('content js');
// 接收到从background.js发送的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { targetTabId, consumerTabId } = request;
  console.log(targetTabId, consumerTabId);
  sendResponse('content send response');
});
