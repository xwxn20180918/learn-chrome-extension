console.log("content.js hello everybody!");chrome.runtime.sendMessage("get-user-data",e=>(console.log("received user data",e),e));chrome.storage.sync.get({namespaced:"aaa"},e=>{console.log(e,"namespaced from background js")});chrome.runtime.onMessage.addListener(function(e,o,t){if(e==="set-data-popup"&&t("set msg from content"),console.log(o.tab?"from a content script:"+o.tab.url:"from the extension"),console.log(e,o,"content script 接收消息"),e.greeting==="hello"){console.log(document,"111111111111");let l=document.querySelector(".aside ul");if(console.log(l,"element"),l){let n=l.getAttribute("routes");console.log(n,"artibute")}t({farewell:"goodbye"})}else t({greeting:"otherAll"})});
