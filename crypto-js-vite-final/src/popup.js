console.log(document.getElementById('clickBtn'));
import CryptoJS from 'crypto-js';
import OSS from 'ali-oss';
import dayjs from 'dayjs';
import { decryptLlgStrPhone } from './llgStrTools.mjs';
import { createLinkResultSummary } from './linkConfigFeedback.mjs';
import {
  LINK_PREFIX_OPTIONS,
  applyManualParams,
  parseLandingUrl,
  replaceMacroParams,
  replaceUrlPrefix,
} from './linkConfigTools.mjs';
import {
  formatBatchUploadJson,
  getFileExtension,
  normalizeUploadPath,
} from './uploadTools.mjs';
import { utoDecrypt } from './utoCryptoTools.mjs';
import {
  formatOmctxOutput,
  omctxDecrypt,
} from './omctxCryptoTools.mjs';

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
  
  // View Mode Logic
  const viewModeRadios = document.getElementsByName('viewMode');
  
  // Initialize view mode from storage
  chrome.storage.local.get(['viewMode'], (result) => {
    const mode = result.viewMode || 'popup';
    viewModeRadios.forEach(radio => {
      if (radio.value === mode) {
        radio.checked = true;
      }
    });
  });

  // Handle view mode change
  viewModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const mode = e.target.value;
      chrome.storage.local.set({ viewMode: mode });
      
      // Send message to background to update panel behavior
      chrome.runtime.sendMessage({
        type: 'SET_VIEW_MODE',
        mode: mode
      });
    });
  });

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

  initLinkConfigTools(addListener);

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

  addListener('llgStrDecrypt', async function () {
    const element = document.getElementById('inputText');
    const result = decryptLlgStrPhone(element.value);
    showOutput(result.toString(), false);
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

  addListener('utoDecrypt', function () {
    const element = document.getElementById('inputText');
    const result = utoDecrypt(element.value);
    showOutput(result === '' ? '' : JSON.stringify(result), result !== '');
  });

  addListener('omctxDecrypt', function () {
    const element = document.getElementById('inputText');
    const result = omctxDecrypt(element.value);
    const output = formatOmctxOutput(result);
    showOutput(output.content, output.isJSON);
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

  const batchFileInput = document.getElementById('batchFileInput');
  if (batchFileInput) {
    batchFileInput.addEventListener('change', () => {
      renderBatchFileSummary(Array.from(batchFileInput.files || []));
    });
  }

  addListener('batchUploadBtn', () => {
    const files = Array.from(batchFileInput?.files || []);
    if (files.length === 0) {
      setBatchUploadStatus('请先选择需要上传的文件', true);
      return;
    }
    uploadBatchToOSS(files);
  });

  addListener('copyBatchJsonBtn', async () => {
    const output = document.getElementById('batchUploadJson');
    const copyBtn = document.getElementById('copyBatchJsonBtn');
    const content = output?.value.trim() || '';

    if (!content) {
      setBatchUploadStatus('暂无可复制的JSON内容', true);
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '已复制';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 1200);
    } catch (error) {
      setBatchUploadStatus(`复制失败: ${error.message}`, true);
    }
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

  // Fixed Phone Numbers
  const fixedPhones = [
    { number: '18876315178', desc: '全国移动' },
    { number: '13608246697', desc: '快付四川' },
    { number: '19534126825', desc: '江苏欣网随心看' },
    { number: '13275966127', desc: '全国联通' },
    { number: '13055211586', desc: '全国联通' },
    { number: '13627357939', desc: '湖南移动' },
    { number: '13986363093', desc: '湖南移动' },
    { number: '13241900000', desc: '北京联通' },
    { number: '18605922676', desc: '蔡伦联通' }
  ];

  const fixedPhoneList = document.getElementById('fixedPhoneList');
  if (fixedPhoneList) {
    fixedPhones.forEach(phone => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 8px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        background: #f8f9fa;
        cursor: pointer;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 2px;
        transition: all 0.2s;
      `;
      btn.innerHTML = `
        <span style="font-weight: 600; color: #333;">${phone.number}</span>
        <span style="font-size: 12px; color: #666;">${phone.desc}</span>
      `;
      
      btn.addEventListener('mouseover', () => {
        btn.style.background = '#eef2ff';
        btn.style.borderColor = '#667eea';
      });
      
      btn.addEventListener('mouseout', () => {
        btn.style.background = '#f8f9fa';
        btn.style.borderColor = '#e0e0e0';
      });

      btn.addEventListener('click', () => {
        const input = document.getElementById('generatedPhone');
        if (input) {
          input.value = phone.number;
          // Optional: Copy to clipboard immediately
          navigator.clipboard.writeText(phone.number).then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = `
              <span style="font-weight: 600; color: #333;">已复制!</span>
              <span style="font-size: 12px; color: #666;">${phone.desc}</span>
            `;
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 1000);
          });
        }
      });
      
      fixedPhoneList.appendChild(btn);
    });
  }

  // Carrier Phone Search Logic
  initCarrierSearch();
}

async function getActiveBrowserTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab || !tab.id) {
    throw new Error('未获取到当前浏览器标签页');
  }

  if (!tab.url) {
    throw new Error('当前标签页没有可读取的URL');
  }

  currentTab = tab;
  return tab;
}

function getLinkConfigElements() {
  return {
    currentUrl: document.getElementById('linkCurrentUrl'),
    manualParams: document.getElementById('manualParamsInput'),
    prefixSelect: document.getElementById('linkPrefixSelect'),
    output: document.getElementById('linkOutput'),
    paramTable: document.getElementById('linkParamTable'),
    copyBtn: document.getElementById('copyLinkResultBtn'),
    summary: document.getElementById('linkResultSummary'),
    summaryBadge: document.getElementById('linkResultBadge'),
    summaryTitle: document.getElementById('linkResultTitle'),
    summaryMessage: document.getElementById('linkResultMessage'),
    summaryUrl: document.getElementById('linkResultUrl'),
    summaryCopyBtn: document.getElementById('copyLinkSummaryBtn'),
  };
}

function setLinkSummary(summaryInput) {
  const {
    summary,
    summaryBadge,
    summaryTitle,
    summaryMessage,
    summaryUrl,
    summaryCopyBtn,
  } = getLinkConfigElements();

  if (!summary || !summaryBadge || !summaryTitle || !summaryMessage || !summaryUrl || !summaryCopyBtn) {
    return;
  }

  const summaryState = createLinkResultSummary(summaryInput);
  summary.className = `link-result-summary is-${summaryState.type}`;
  summaryBadge.textContent = summaryState.title;
  summaryTitle.textContent = summaryState.title;
  summaryMessage.textContent = summaryState.message;
  summaryUrl.textContent = summaryState.url;
  summaryUrl.title = summaryState.url;
  summaryCopyBtn.disabled = !summaryState.url;
  summaryCopyBtn.dataset.copyUrl = summaryState.url;
}

function setLinkOutput(message, isError = false, summaryInput = null) {
  const { output } = getLinkConfigElements();
  if (!output) return;

  output.value = message;
  output.classList.toggle('link-error-output', isError);

  if (summaryInput) {
    setLinkSummary(summaryInput);
  }
}

function clearLinkParamTable() {
  const { paramTable } = getLinkConfigElements();
  if (!paramTable) return;

  paramTable.innerHTML = '';
  paramTable.classList.remove('active');
}

function formatUrlChange(title, beforeUrl, afterUrl) {
  return `${title}\n\n变更前：\n${beforeUrl}\n\n变更后：\n${afterUrl}`;
}

function renderParamTable(params) {
  const { paramTable } = getLinkConfigElements();
  if (!paramTable) return;

  paramTable.innerHTML = '';

  if (params.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'link-param-row';
    const keyCell = document.createElement('div');
    keyCell.className = 'link-param-key';
    keyCell.textContent = '参数';
    const valueCell = document.createElement('div');
    valueCell.className = 'link-param-value';
    valueCell.textContent = '当前链接没有查询参数';
    emptyRow.appendChild(keyCell);
    emptyRow.appendChild(valueCell);
    paramTable.appendChild(emptyRow);
  } else {
    params.forEach(({ key, value }) => {
      const row = document.createElement('div');
      row.className = 'link-param-row';
      const keyCell = document.createElement('div');
      keyCell.className = 'link-param-key';
      keyCell.textContent = key;
      const valueCell = document.createElement('div');
      valueCell.className = 'link-param-value';
      valueCell.textContent = value;
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      paramTable.appendChild(row);
    });
  }

  paramTable.classList.add('active');
}

function renderLandingUrlResult(url) {
  const result = parseLandingUrl(url);
  setLinkOutput([
    'URL参数解析',
    '',
    `完整链接：${result.href}`,
    `协议：${result.protocol}`,
    `域名：${result.host}`,
    `路径：${result.path || '/'}`,
    `Hash：${result.hash || '无'}`,
    `参数数量：${result.params.length}`,
  ].join('\n'), false, {
    type: 'parse',
    protocol: result.protocol,
    host: result.host,
    path: result.path || '/',
    paramCount: result.params.length,
  });
  renderParamTable(result.params);
}

async function refreshLinkConfigUrl() {
  const { currentUrl } = getLinkConfigElements();
  if (!currentUrl) return;

  const tab = await getActiveBrowserTab();
  currentUrl.value = tab.url;
  clearLinkParamTable();
  setLinkOutput('已读取当前地址栏URL', false, {
    type: 'success',
    title: '已读取当前地址栏URL',
    url: tab.url,
  });
}

async function applyCurrentTabUrlChange(title, transformUrl) {
  const { currentUrl } = getLinkConfigElements();
  const tab = await getActiveBrowserTab();
  const beforeUrl = tab.url;
  const afterUrl = transformUrl(beforeUrl);

  if (afterUrl === beforeUrl) {
    if (currentUrl) currentUrl.value = beforeUrl;
    clearLinkParamTable();
    setLinkOutput(`${title}\n\n当前链接没有可处理的变化。`, false, {
      type: 'no-change',
      title,
    });
    return;
  }

  await chrome.tabs.update(tab.id, { url: afterUrl });
  if (currentUrl) currentUrl.value = afterUrl;
  clearLinkParamTable();
  setLinkOutput(formatUrlChange(title, beforeUrl, afterUrl), false, {
    type: 'success',
    title,
    url: afterUrl,
  });
}

function initLinkConfigTools(addListener) {
  const elements = getLinkConfigElements();
  if (!elements.currentUrl || !elements.prefixSelect || !elements.output) {
    return;
  }

  LINK_PREFIX_OPTIONS.forEach((prefix) => {
    const option = document.createElement('option');
    option.value = prefix;
    option.textContent = prefix;
    elements.prefixSelect.appendChild(option);
  });

  const runSafely = async (task) => {
    try {
      await task();
    } catch (error) {
      clearLinkParamTable();
      setLinkOutput(error.message || '链接处理失败', true, {
        type: 'error',
        message: error.message || '链接处理失败',
      });
    }
  };

  addListener('refreshCurrentUrl', () => runSafely(refreshLinkConfigUrl));

  addListener('replaceMacroParamsBtn', () => runSafely(() => {
    return applyCurrentTabUrlChange('宏参数已替换', replaceMacroParams);
  }));

  addListener('parseLandingUrlBtn', () => runSafely(async () => {
    const tab = await getActiveBrowserTab();
    elements.currentUrl.value = tab.url;
    renderLandingUrlResult(tab.url);
  }));

  addListener('applyManualParamsBtn', () => runSafely(() => {
    const paramsText = elements.manualParams ? elements.manualParams.value : '';
    if (!paramsText.trim()) {
      throw new Error('请输入需要添加或覆盖的参数');
    }
    return applyCurrentTabUrlChange('参数已应用到地址栏', (url) => {
      return applyManualParams(url, paramsText);
    });
  }));

  addListener('replacePrefixBtn', () => runSafely(() => {
    const prefix = elements.prefixSelect.value;
    return applyCurrentTabUrlChange('链接前缀已替换', (url) => {
      return replaceUrlPrefix(url, prefix);
    });
  }));

  addListener('copyLinkResultBtn', () => runSafely(async () => {
    const text = elements.output.value.trim();
    if (!text) {
      throw new Error('暂无可复制的处理结果');
    }
    await navigator.clipboard.writeText(text);
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = '已复制';
    setTimeout(() => {
      elements.copyBtn.textContent = originalText;
    }, 1200);
  }));

  addListener('copyLinkSummaryBtn', () => runSafely(async () => {
    const text = elements.summaryCopyBtn.dataset.copyUrl || '';
    if (!text) {
      throw new Error('暂无可复制的新URL');
    }
    await navigator.clipboard.writeText(text);
    const originalText = elements.summaryCopyBtn.textContent;
    elements.summaryCopyBtn.textContent = '已复制';
    setTimeout(() => {
      elements.summaryCopyBtn.textContent = originalText;
    }, 1200);
  }));

  runSafely(refreshLinkConfigUrl);
}

// Carrier Search Implementation
const provinceData = {
  "北京": ["北京"],
  "上海": ["上海"],
  "天津": ["天津"],
  "重庆": ["重庆"],
  "河北": ["石家庄", "唐山", "秦皇岛", "邯郸", "邢台", "保定", "张家口", "承德", "沧州", "廊坊", "衡水"],
  "山西": ["太原", "大同", "阳泉", "长治", "晋城", "朔州", "晋中", "运城", "忻州", "临汾", "吕梁"],
  "辽宁": ["沈阳", "大连", "鞍山", "抚顺", "本溪", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "朝阳", "葫芦岛"],
  "吉林": ["长春", "吉林", "四平", "辽源", "通化", "白山", "松原", "白城", "延边"],
  "黑龙江": ["哈尔滨", "齐齐哈尔", "鸡西", "鹤岗", "双鸭山", "大庆", "伊春", "佳木斯", "七台河", "牡丹江", "黑河", "绥化", "大兴安岭"],
  "江苏": ["南京", "无锡", "徐州", "常州", "苏州", "南通", "连云港", "淮安", "盐城", "扬州", "镇江", "泰州", "宿迁"],
  "浙江": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "金华", "衢州", "舟山", "台州", "丽水"],
  "安徽": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵", "安庆", "黄山", "滁州", "阜阳", "宿州", "六安", "亳州", "池州", "宣城"],
  "福建": ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
  "江西": ["南昌", "景德镇", "萍乡", "九江", "新余", "鹰潭", "赣州", "吉安", "宜春", "抚州", "上饶"],
  "山东": ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁", "泰安", "威海", "日照", "临沂", "德州", "聊城", "滨州", "菏泽"],
  "河南": ["郑州", "开封", "洛阳", "平顶山", "安阳", "鹤壁", "新乡", "焦作", "濮阳", "许昌", "漯河", "三门峡", "南阳", "商丘", "信阳", "周口", "驻马店", "济源"],
  "湖北": ["武汉", "黄石", "十堰", "宜昌", "襄阳", "鄂州", "荆门", "孝感", "荆州", "黄冈", "咸宁", "随州", "恩施", "仙桃", "潜江", "天门", "神农架"],
  "湖南": ["长沙", "株洲", "湘潭", "衡阳", "邵阳", "岳阳", "常德", "张家界", "益阳", "郴州", "永州", "怀化", "娄底", "湘西"],
  "广东": ["广州", "深圳", "珠海", "汕头", "韶关", "佛山", "江门", "湛江", "茂名", "肇庆", "惠州", "梅州", "汕尾", "河源", "阳江", "清远", "东莞", "中山", "潮州", "揭阳", "云浮"],
  "广西": ["南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港", "玉林", "百色", "贺州", "河池", "来宾", "崇左"],
  "海南": ["海口", "三亚", "三沙", "儋州", "五指山", "琼海", "文昌", "万宁", "东方", "定安", "屯昌", "澄迈", "临高", "白沙", "昌江", "乐东", "陵水", "保亭", "琼中"],
  "四川": ["成都", "自贡", "攀枝花", "泸州", "德阳", "绵阳", "广元", "遂宁", "内江", "乐山", "南充", "眉山", "宜宾", "广安", "达州", "雅安", "巴中", "资阳", "阿坝", "甘孜", "凉山"],
  "贵州": ["贵阳", "六盘水", "遵义", "安顺", "毕节", "铜仁", "黔西南", "黔东南", "黔南"],
  "云南": ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧", "楚雄", "红河", "文山", "西双版纳", "大理", "德宏", "怒江", "迪庆"],
  "西藏": ["拉萨", "日喀则", "昌都", "林芝", "山南", "那曲", "阿里"],
  "陕西": ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
  "甘肃": ["兰州", "嘉峪关", "金昌", "白银", "天水", "武威", "张掖", "平凉", "酒泉", "庆阳", "定西", "陇南", "临夏", "甘南"],
  "青海": ["西宁", "海东", "海北", "黄南", "海南", "果洛", "玉树", "海西"],
  "宁夏": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
  "新疆": ["乌鲁木齐", "克拉玛依", "吐鲁番", "哈密", "昌吉", "博尔塔拉", "巴音郭楞", "阿克苏", "克孜勒苏", "喀什", "和田", "伊犁", "塔城", "阿勒泰", "石河子", "阿拉尔", "图木舒克", "五家渠", "北屯", "铁门关", "双河", "可克达拉", "昆玉", "胡杨河"]
};

function initCarrierSearch() {
  const provinceSelect = document.getElementById('provinceSelect');
  const citySelect = document.getElementById('citySelect');
  const carrierSelect = document.getElementById('carrierSelect');
  const searchBtn = document.getElementById('searchPhoneBtn');
  const resultContainer = document.getElementById('searchResult');

  if (!provinceSelect || !citySelect || !carrierSelect || !searchBtn || !resultContainer) {
    return;
  }

  // Initialize Provinces
  Object.keys(provinceData).forEach(province => {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  });

  // Handle Province Change
  provinceSelect.addEventListener('change', () => {
    const province = provinceSelect.value;
    citySelect.innerHTML = '<option value="">选择城市</option>';
    citySelect.disabled = !province;
    
    if (province && provinceData[province]) {
      provinceData[province].forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }
  });

  // Handle Search
  searchBtn.addEventListener('click', async () => {
    const province = provinceSelect.value;
    const city = citySelect.value;
    const carrier = carrierSelect.value;

    const params = new URLSearchParams({
      limit: 10
    });
    
    if (province) params.append('province', province);
    if (city) params.append('city', city);
    if (carrier) params.append('carrier', carrier);

    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span class="spinner"></span> 查询中...';
    searchBtn.style.opacity = '0.7';
    resultContainer.innerHTML = '';

    try {
      const response = await fetch(`https://card.wi-fi.cn/order/area-number?${params.toString()}`);
      const data = await response.json();

      if (data && data.data && Array.isArray(data.data)) {
        renderPhoneResults(data.data, resultContainer);
      } else {
        resultContainer.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 20px; color: #666;">未查询到号码</div>';
      }
    } catch (error) {
      console.error('Search failed:', error);
      resultContainer.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 20px; color: red;">查询失败，请稍后重试</div>';
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = '查询号码';
      searchBtn.style.opacity = '1';
    }
  });
}

function renderPhoneResults(phones, container) {
  if (phones.length === 0) {
    container.innerHTML = '<div style="grid-column: span 2; text-align: center; padding: 20px; color: #666;">未查询到号码</div>';
    return;
  }

  phones.forEach(item => {
    const phone = item.number;
    const btn = document.createElement('button');
    btn.style.cssText = `
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      color: #333;
      transition: all 0.2s;
    `;
    btn.textContent = phone;
    
    btn.addEventListener('mouseover', () => {
      btn.style.background = '#eef2ff';
      btn.style.borderColor = '#667eea';
    });
    
    btn.addEventListener('mouseout', () => {
      btn.style.background = '#fff';
      btn.style.borderColor = '#e0e0e0';
    });

    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(phone).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '已复制!';
        btn.style.background = '#d1fae5';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#065f46';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '#fff';
          btn.style.borderColor = '#e0e0e0';
          btn.style.color = '#333';
        }, 1000);
      });
    });
    
    container.appendChild(btn);
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

const createOSSUploadContext = async () => {
  const res = await getOSSConfig();
  const decryptedRes = llgDecrypt(res);
  const jsonRes = JSON.parse(decryptedRes);
  const data = jsonRes.data;

  if (!data) {
    throw new Error('OSS配置无效');
  }

  return {
    data,
    client: new OSS({
      region: data.Region,
      accessKeyId: data.AccessKeyId,
      accessKeySecret: data.AccessKeySecret,
      stsToken: data.SecurityToken,
      bucket: data.Bucket
    }),
    now: dayjs().locale('zh-cn').format('YYYY/MM/DD/HH'),
  };
};

const uploadSingleFile = async (file, client, data, customPath, now) => {
  const suffix = getFileExtension(file.name);
  const signature = Date.now() + Math.random().toString(36).substring(7);
  const urlPath = `${normalizeUploadPath(customPath)}/${now}/${signature}${suffix}`;
  
  await client.put(urlPath, file);
  return `${data.Hostname.replace(/\/$/, '')}/${urlPath}`;
};

const uploadToOSS = async (file) => {
  const statusDiv = document.getElementById('uploadStatus');
  const uploadBtn = document.getElementById('uploadBtn');

  try {
    statusDiv.textContent = '正在获取配置...';
    uploadBtn.disabled = true;

    const { client, data, now } = await createOSSUploadContext();

    statusDiv.textContent = '正在上传...';
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

function renderBatchFileSummary(files) {
  const summary = document.getElementById('batchFileSummary');
  if (!summary) return;

  if (files.length === 0) {
    summary.textContent = '暂未选择文件';
    summary.title = '';
    return;
  }

  const fileNames = files.map((file) => file.name);
  const visibleNames = fileNames.slice(0, 5).join('、');
  const remainingText = fileNames.length > 5 ? ` 等${fileNames.length}个文件` : '';
  summary.textContent = `已选择 ${fileNames.length} 个文件：${visibleNames}${remainingText}`;
  summary.title = fileNames.join('\n');
}

function setBatchUploadStatus(message, isError = false) {
  const status = document.getElementById('batchUploadStatus');
  if (!status) return;

  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

function renderBatchUploadErrors(failures) {
  const container = document.getElementById('batchUploadErrors');
  if (!container) return;

  container.innerHTML = '';
  if (failures.length === 0) return;

  const title = document.createElement('strong');
  title.textContent = `失败文件（${failures.length}）`;
  container.appendChild(title);

  failures.forEach(({ fileName, message }) => {
    const row = document.createElement('div');
    row.textContent = `${fileName}: ${message}`;
    container.appendChild(row);
  });
}

const uploadBatchToOSS = async (files) => {
  const uploadBtn = document.getElementById('batchUploadBtn');
  const output = document.getElementById('batchUploadJson');
  const copyBtn = document.getElementById('copyBatchJsonBtn');
  const customPath = document.getElementById('batchUploadPath')?.value || 'upload';

  uploadBtn.disabled = true;
  copyBtn.disabled = true;
  output.value = '';
  renderBatchUploadErrors([]);

  try {
    setBatchUploadStatus('正在获取上传配置...');
    const { client, data, now } = await createOSSUploadContext();
    let completed = 0;

    const tasks = files.map((file) => {
      return uploadSingleFile(file, client, data, customPath, now).finally(() => {
        completed += 1;
        setBatchUploadStatus(`正在上传 ${completed}/${files.length}...`);
      });
    });

    const settledResults = await Promise.allSettled(tasks);
    const successes = [];
    const failures = [];

    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successes.push({
          fileName: files[index].name,
          url: result.value,
        });
      } else {
        failures.push({
          fileName: files[index].name,
          message: result.reason?.message || '上传失败',
        });
      }
    });

    output.value = formatBatchUploadJson(successes);
    copyBtn.disabled = successes.length === 0;
    renderBatchUploadErrors(failures);

    const statusText = failures.length === 0
      ? `全部上传完成，共 ${successes.length} 个文件`
      : `上传完成：成功 ${successes.length} 个，失败 ${failures.length} 个`;
    setBatchUploadStatus(statusText, successes.length === 0);
  } catch (error) {
    console.error('Batch upload failed:', error);
    setBatchUploadStatus(`批量上传失败: ${error.message}`, true);
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
