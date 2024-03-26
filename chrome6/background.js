// 插件右键快捷键
// 点击右键进行选择
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'group1') {
    console.log('分组文字1', info);
  }
  if (info.menuItemId === 'group2') {
    console.log('分组文字2');
  }
  // 点击获取到数据
  if (info.menuItemId === 'fetch') {
    console.log('fetch 获取数据');
    const res = fetch('http://localhost:8080/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      console.log(res, '获取到http://localhost:8080/api接口数据');
      chrome.storage.sync.set({ color: 'red' }, function (err, data) {
        console.log('store success!');
      });
    });
  }
  // 创建百度搜索,并跳转到搜索结果页
  if (info.menuItemId === 'baidusearch1') {
    // console.log(info, tab, "baidusearch1")
    // 创建一个新的tab页面
    chrome.tabs.create({
      url:
        'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(info.selectionText),
    });
  }
});

// 创建右键快捷键
chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  let contexts = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio',
  ];
  // for (let i = 0; i < contexts.length; i++) {
  //   let context = contexts[i];
  //   let title = "Test '" + context + "' menu item";
  //   chrome.contextMenus.create({
  //     title: title,
  //     contexts: [context],
  //     id: context,
  //   });
  // }

  // Create a parent item and two children.
  let parent = chrome.contextMenus.create({
    title: '操作数据分组',
    id: 'parent',
  });
  chrome.contextMenus.create({
    title: '分组1',
    parentId: parent,
    id: 'group1',
  });
  chrome.contextMenus.create({
    title: '分组2',
    parentId: parent,
    id: 'group2',
  });
  chrome.contextMenus.create({
    title: '获取远程数据',
    parentId: parent,
    id: 'fetch',
  });

  // Create a radio item.
  chrome.contextMenus.create({
    title: '创建单选按钮1',
    type: 'radio',
    id: 'radio1',
  });
  chrome.contextMenus.create({
    title: '创建单选按钮2',
    type: 'radio',
    id: 'radio2',
  });

  // Create a checkbox item.
  chrome.contextMenus.create({
    title: '可以多选的复选框1',
    type: 'checkbox',
    id: 'checkbox',
  });
  chrome.contextMenus.create({
    title: '可以多选的复选框2',
    type: 'checkbox',
    id: 'checkbox2',
  });

  // 在title属性中有一个%s的标识符，当contexts为selection，使用%s来表示选中的文字
  chrome.contextMenus.create({
    id: 'baidusearch1',
    title: '使用百度搜索：%s',
    contexts: ['selection'],
  });

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  chrome.contextMenus.create(
    { title: 'Oops', parentId: 999, id: 'errorItem' },
    function () {
      if (chrome.runtime.lastError) {
        console.log('Got expected error: ' + chrome.runtime.lastError.message);
      }
    }
  );
});
