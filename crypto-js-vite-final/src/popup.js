console.log(document.getElementById('clickBtn'));
import CryptoJS from 'crypto-js';
import OSS from 'ali-oss';
import dayjs from 'dayjs';

const llgIv = 'yZM2mn0akhcq4VQK';
const llgSecret = 'KEYTphIWNO1D9LfMsHoi0by3AZcR5tvu';

function llgEncrypt(str) {
  const result = CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(llgSecret), {
    iv: CryptoJS.enc.Utf8.parse(llgIv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return result + '';
}

function llgDecrypt(str) {
  if (str === null) return '';
  return CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(llgSecret), {
    iv: CryptoJS.enc.Utf8.parse(llgIv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
}

const ytSecret = CryptoJS.enc.Base64.parse(
  'BY6FRfeRiaFlMWFb6ozu3FIIp0m6sR/ay/5+075xkFY='
);

function ytEncrypt(data) {
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const ivString = iv.toString(CryptoJS.enc.Base64);
  const value = CryptoJS.AES.encrypt(data, ytSecret, {
    iv
  }).toString();
  const mac = CryptoJS.HmacSHA256(
    `${ivString}${value}`,
    ytSecret
  ).toString();

  return btoa(JSON.stringify({
    iv: ivString,
    mac,
    value,
    tag: ''
  }));
}

function ytDecrypt(str) {
  const encrypted = JSON.parse(atob(str));

  return CryptoJS.AES.decrypt(encrypted.value, ytSecret, {
    iv: CryptoJS.enc.Base64.parse(encrypted.iv)
  }).toString(CryptoJS.enc.Utf8);
}

const xmjzsecret = CryptoJS.enc.Base64.parse(
    'BY6FRfeRiaFlMWFb6ozu3FIIp0m6sR/ay/5+075xkFY='
);

const xmjzApiSecret = CryptoJS.enc.Base64.parse(
    'vRnB4TvdM/Gfc5zS1hC8NFrBZI8RGfW43Q7ZaD9dBak='
);

function xmjzEncrypt(data, isApi = false) {
  let encryptSecret = xmjzsecret;
  if (isApi) {
    encryptSecret = xmjzApiSecret;
  }
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const ivString = iv.toString(CryptoJS.enc.Base64);
  const value = CryptoJS.AES.encrypt(data, encryptSecret, {
    iv
  }).toString();
  const mac = CryptoJS.HmacSHA256(
      `${ivString}${value}`,
      encryptSecret
  ).toString();

  return btoa(
      JSON.stringify({
        iv: ivString,
        mac,
        value,
        tag: ''
      })
  );
}

function xmjzDecrypt(str, isApi = false) {
  let encryptSecret = xmjzsecret;
  if (isApi) {
    encryptSecret = xmjzApiSecret;
  }
  const encrypted = JSON.parse(atob(str));

 return  CryptoJS.AES.decrypt(encrypted.value, encryptSecret, {
    iv: CryptoJS.enc.Base64.parse(encrypted.iv)
  }).toString(CryptoJS.enc.Utf8);
}

// JSON Viewer 功能
class JSONViewer {
  constructor(container) {
    this.container = container;
    this.jsonData = null;
    this.isExpanded = false;
  }

  // 渲染JSON数据
  render(jsonString) {
    try {
      this.jsonData = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      this.container.innerHTML = '';
      
      // 添加工具栏
      this.addToolbar();
      
      // 渲染JSON树
      const treeContainer = document.createElement('div');
      treeContainer.className = 'json-tree';
      this.container.appendChild(treeContainer);
      
      this.renderNode(this.jsonData, treeContainer, 'root');
      
      // 默认展开所有节点
      this.expandAll();
      
    } catch (error) {
      this.container.innerHTML = `<div class="json-error">无效的JSON格式: ${error.message}</div>`;
    }
  }

  // 添加工具栏
  addToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'json-toolbar';
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'toolbar-btn';
    expandBtn.innerHTML = '🔽 展开全部';
    expandBtn.onclick = () => this.expandAll();
    
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'toolbar-btn';
    collapseBtn.innerHTML = '🔼 折叠全部';
    collapseBtn.onclick = () => this.collapseAll();
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'toolbar-btn';
    copyBtn.innerHTML = '📋 复制JSON';
    copyBtn.onclick = () => this.copyJSON();
    
    const rawBtn = document.createElement('button');
    rawBtn.className = 'toolbar-btn';
    rawBtn.innerHTML = '📄 原始文本';
    rawBtn.onclick = () => this.showRawText();
    
    toolbar.appendChild(expandBtn);
    toolbar.appendChild(collapseBtn);
    toolbar.appendChild(copyBtn);
    toolbar.appendChild(rawBtn);
    
    this.container.appendChild(toolbar);
  }

  // 渲染JSON节点
  renderNode(data, container, key, path = '') {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'json-node';
    
    if (data === null) {
      nodeDiv.innerHTML = `<span class="json-key">${key}:</span> <span class="json-null">null</span>`;
    } else if (typeof data === 'boolean') {
      nodeDiv.innerHTML = `<span class="json-key">${key}:</span> <span class="json-boolean">${data}</span>`;
    } else if (typeof data === 'number') {
      nodeDiv.innerHTML = `<span class="json-key">${key}:</span> <span class="json-number">${data}</span>`;
    } else if (typeof data === 'string') {
      nodeDiv.innerHTML = `<span class="json-key">${key}:</span> <span class="json-string">"${this.escapeHtml(data)}"</span>`;
    } else if (Array.isArray(data)) {
      const arrayHeader = document.createElement('div');
      arrayHeader.className = 'json-array-header';
      arrayHeader.innerHTML = `<span class="json-toggle" data-path="${path}">▶</span> <span class="json-key">${key}:</span> <span class="json-bracket">[</span><span class="json-count">${data.length} items</span><span class="json-bracket">]</span>`;
      
      const arrayContent = document.createElement('div');
      arrayContent.className = 'json-array-content';
      arrayContent.style.display = 'none';
      
      data.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'json-array-item';
        itemDiv.innerHTML = `<span class="json-index">[${index}]</span>`;
        this.renderNode(item, itemDiv, '', `${path}[${index}]`);
        arrayContent.appendChild(itemDiv);
      });
      
      nodeDiv.appendChild(arrayHeader);
      nodeDiv.appendChild(arrayContent);
      
      // 添加点击事件
      arrayHeader.querySelector('.json-toggle').onclick = (e) => {
        const toggle = e.target;
        const content = arrayContent;
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggle.textContent = '▼';
        } else {
          content.style.display = 'none';
          toggle.textContent = '▶';
        }
      };
      
    } else if (typeof data === 'object') {
      const objectHeader = document.createElement('div');
      objectHeader.className = 'json-object-header';
      const keys = Object.keys(data);
      objectHeader.innerHTML = `<span class="json-toggle" data-path="${path}">▶</span> <span class="json-key">${key}:</span> <span class="json-brace">{</span><span class="json-count">${keys.length} properties</span><span class="json-brace">}</span>`;
      
      const objectContent = document.createElement('div');
      objectContent.className = 'json-object-content';
      objectContent.style.display = 'none';
      
      keys.forEach(propKey => {
        const propDiv = document.createElement('div');
        propDiv.className = 'json-property';
        this.renderNode(data[propKey], propDiv, propKey, path ? `${path}.${propKey}` : propKey);
        objectContent.appendChild(propDiv);
      });
      
      nodeDiv.appendChild(objectHeader);
      nodeDiv.appendChild(objectContent);
      
      // 添加点击事件
      objectHeader.querySelector('.json-toggle').onclick = (e) => {
        const toggle = e.target;
        const content = objectContent;
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggle.textContent = '▼';
        } else {
          content.style.display = 'none';
          toggle.textContent = '▶';
        }
      };
    }
    
    container.appendChild(nodeDiv);
  }

  // 展开所有节点
  expandAll() {
    const toggles = this.container.querySelectorAll('.json-toggle');
    toggles.forEach(toggle => {
      const content = toggle.parentElement.nextElementSibling;
      if (content && content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▼';
      }
    });
  }

  // 折叠所有节点
  collapseAll() {
    const toggles = this.container.querySelectorAll('.json-toggle');
    toggles.forEach(toggle => {
      const content = toggle.parentElement.nextElementSibling;
      if (content) {
        content.style.display = 'none';
        toggle.textContent = '▶';
      }
    });
  }

  // 复制JSON
  copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(this.jsonData, null, 2));
    this.showToast('JSON已复制到剪贴板');
  }

  // 显示原始文本
  showRawText() {
    const rawText = JSON.stringify(this.jsonData, null, 2);
    this.container.innerHTML = `<div class="json-raw"><pre>${this.escapeHtml(rawText)}</pre></div>`;
  }

  // 显示提示
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'json-toast';
    toast.textContent = message;
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  // HTML转义
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

let currentTab;
let jsonViewer;

// 初始化函数
function init() {
  console.log('Popup initialized');
  
  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  console.log('Found tab buttons:', tabBtns.length);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Tab clicked:', btn.getAttribute('data-tab'));
      
      // Remove active class from all buttons and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked button
      btn.classList.add('active');

      // Show corresponding content
      const tabId = btn.getAttribute('data-tab');
      const content = document.getElementById(tabId);
      if (content) {
        content.classList.add('active');
      } else {
        console.error('Tab content not found for id:', tabId);
      }
    });
  });

  const outputContainer = document.getElementById('outputText');
  const jsonViewerContainer = document.createElement('div');
  jsonViewerContainer.id = 'jsonViewerContainer';
  jsonViewerContainer.style.display = 'none';
  outputContainer.parentNode.appendChild(jsonViewerContainer);
  
  jsonViewer = new JSONViewer(jsonViewerContainer);

  // Helper to add listener safely
  const addListener = (id, handler) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', handler);
    } else {
      console.warn(`Element with id '${id}' not found`);
    }
  };

  addListener('llgEncrypt', async function () {
    const element = document.getElementById('inputText');
    const result = llgEncrypt(JSON.stringify(element.value));
    showOutput(result, false);
  });

  addListener('llgDecrypt', async function () {
    const element = document.getElementById('inputText');
    const result = llgDecrypt(element.value);
    showOutput(result, true);
  });

  addListener('ytEncrypt', async function () {
    const element = document.getElementById('inputText');
    const result = ytEncrypt(JSON.stringify(element.value));
    showOutput(result, false);
  });

  addListener('ytDecrypt', async function () {
    const element = document.getElementById('inputText');
    const result = ytDecrypt(element.value);
    showOutput(result, true);
  });

  addListener('xmjzEncrypt', async function () {
    const element = document.getElementById('inputText');
    const result = xmjzEncrypt(JSON.stringify(element.value), true);
    showOutput(result, false);
  });

  addListener('xmjzDecrypt', async function () {
    const element = document.getElementById('inputText');
    const result = xmjzDecrypt(element.value, true);
    showOutput(result, true);
  });

  addListener('json', function () {
    const outputText = document.getElementById('outputText');
    const jsonViewerContainer = document.getElementById('jsonViewerContainer');
    
    let content = '';
    if (jsonViewerContainer.style.display !== 'none') {
      content = jsonViewer.jsonData ? JSON.stringify(jsonViewer.jsonData) : '';
    } else {
      content = outputText.textContent;
    }
    
    navigator.clipboard.writeText(content);
    window.alert('复制成功');
    window.open('https://www.json.cn/', 'blank');
  });

  addListener('uploadBtn', () => {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (!files || files.length === 0) {
      alert('请先选择图片');
      return;
    }
    
    uploadToOSS(files[0]);
  });

  // Phone Number Generator
  addListener('generatePhoneBtn', () => {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', 
                     '150', '151', '152', '153', '155', '156', '157', '158', '159', 
                     '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
                     '170', '171', '172', '173', '174', '175', '176', '177', '178',
                     '190', '191', '192', '193', '195', '196', '197', '198', '199'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    // Generate remaining 8 digits
    let suffix = '';
    for (let i = 0; i < 8; i++) {
      suffix += Math.floor(Math.random() * 10);
    }
    const phoneNumber = prefix + suffix;
    const input = document.getElementById('generatedPhone');
    if (input) {
      input.value = phoneNumber;
    }
  });
}

// 确保DOM加载完成后执行初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}



// 显示JSON Viewer或原始文本
function showOutput(content, isJSON = false) {
  const outputText = document.getElementById('outputText');
  const jsonViewerContainer = document.getElementById('jsonViewerContainer');
  
  if (isJSON && jsonViewer) {
    try {
      JSON.parse(content);
      outputText.style.display = 'none';
      jsonViewerContainer.style.display = 'block';
      jsonViewer.render(content);
    } catch (e) {
      // 如果不是有效JSON，显示原始文本
      outputText.style.display = 'block';
      jsonViewerContainer.style.display = 'none';
      outputText.textContent = content;
    }
  } else {
    outputText.style.display = 'block';
    jsonViewerContainer.style.display = 'none';
    outputText.textContent = content;
  }
}



// OSS Upload Logic
const getOSSConfig = async () => {
  try {
    const response = await fetch('https://api.liuliangguo.com/file/oss-config.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Not-Encrypt': 0,
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch OSS config:', error);
    throw error;
  }
};

const uploadSingleFile = async (file, client, data, customPath, now) => {
  const suffix = file.name.slice(file.name.lastIndexOf('.'));
  const signature = Date.now() + Math.random().toString(36).substring(7);
  const urlPath = `${customPath}/${now}/${signature}${suffix}`;
  
  await client.put(urlPath, file);
  return `${data.Hostname}/${urlPath}`;
};

const uploadToOSS = async (file) => {
  const statusDiv = document.getElementById('uploadStatus');
  const uploadBtn = document.getElementById('uploadBtn');

  try {
    statusDiv.textContent = '正在获取配置...';
    uploadBtn.disabled = true;

    const res = await getOSSConfig();
    const decryptedRes = llgDecrypt(res);
    const jsonRes = JSON.parse(decryptedRes);
    const data = jsonRes.data;

    statusDiv.textContent = '正在上传...';

    const client = new OSS({
      region: data.Region,
      accessKeyId: data.AccessKeyId,
      accessKeySecret: data.AccessKeySecret,
      stsToken: data.SecurityToken,
      bucket: data.Bucket
    });

    const now = dayjs().locale('zh-cn').format('YYYY/MM/DD/HH');
    const customPath = document.getElementById('uploadPath').value || 'upload';

    const fileUrl = await uploadSingleFile(file, client, data, customPath, now);
    
    // Create result display with copy button
    statusDiv.innerHTML = '';
    const resultContainer = document.createElement('div');
    resultContainer.className = 'upload-result-container';
    
    const urlLink = document.createElement('a');
    urlLink.href = fileUrl;
    urlLink.target = '_blank';
    urlLink.textContent = fileUrl;
    urlLink.className = 'file-link';
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '复制链接';
    copyBtn.className = 'copy-link-btn';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fileUrl).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      });
    };
    
    resultContainer.appendChild(urlLink);
    resultContainer.appendChild(copyBtn);
    
    statusDiv.appendChild(resultContainer);
    statusDiv.style.color = 'green';

  } catch (error) {
    console.error('Upload failed:', error);
    statusDiv.textContent = `上传失败: ${error.message}`;
    statusDiv.style.color = 'red';
  } finally {
    uploadBtn.disabled = false;
  }
};





// 接收消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const {action, payload} = request;
  console.log(request, 'popup got');
  sendResponse('popup got!');
});

// 接收 storage 中的数据
chrome.storage.sync.get({namespaced: 'aaa'}, (data) => {
  console.log(data, 'namespaced from background js');
});

// popup 通过 chrome.tabs.sendMessage 发送消息，
// content接收到content的消息后，通过 sendResponse将 greeting 数据发送出去
(async () => {
  // 查询当前tab
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
    currentWindow: true
  });
  currentTab = tab;
  // 和当前tab进行通信， 可以接收到content.js文件第31行的返回数据
  // const response = await chrome.tabs.sendMessage(tab.id, {
  //   greeting: 'hello',
  // });
  // do something with response here, not outside the function
  // console.log(response, "popup response");
})();
