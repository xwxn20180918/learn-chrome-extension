var a="RELOAD";chrome.runtime.onMessage.addListener((e,s,n)=>{e.msg==a&&(chrome.runtime.reload(),n())});let t="BACKGROUND HELLO~~~~";chrome.runtime.onInstalled.addListener(async()=>{console.log("background js");const e=await chrome.tabs.query({url:["https://blog.csdn.net/*","https://juejin.cn/post/*"]});e&&e.forEach(s=>{}),chrome.runtime.onMessage.addListener((s,n,r)=>{s==="get-user-data"&&r(t)}),chrome.storage.sync.set({namespaced:"run background js storage"})});
