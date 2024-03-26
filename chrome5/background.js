// 使用action点击事件，才能使用 chrome.tabs.sendMessage 发送消息
// 点击插件图标，发送一次消息
// 需要取消掉popup弹窗页面设置
chrome.action.onClicked.addListener(async (tab) => {
  const currentTabId = tab.id;
  // 获取当前窗口，激活页面的id
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })

  const receiverTabId = tabs[0].id;
  // Send a message to the receiver tab
  chrome.tabs.sendMessage(receiverTabId, {
    targetTabId: currentTabId,
    consumerTabId: receiverTabId
  }, (response)=>{
    console.log('received content data', response);
  });
});
