# 加解密数据新增解密工具设计

## 目标

在“加解密数据”Tab 中增加“优投落地页解密”和“OMCTX解密”按钮，使用各自协议解密输入内容，并通过现有输出区域展示结果。

## 交互

- 两个新按钮放在现有解密按钮附近；优投落地页按钮沿用优投按钮的视觉样式。
- 点击按钮后读取现有 `inputText` 输入框内容。
- 优投落地页解密成功时，将结果序列化后交给现有 JSON Viewer 展示。
- OMCTX 解密成功时，将查询参数串转换为键值 JSON 并通过 JSON Viewer 展示；其他内容在现有输出框中按普通文本展示。
- 输入为空、密文无效、解密或解析失败时，清空输出，不弹出错误提示。

## 实现

- 新建 `src/utoCryptoTools.mjs`，导出 `utoDecrypt`。
- 默认密钥为 `DD1Eovf4QTWRWqpT0o5fQzvunrR49jvL`。
- 默认 IV 为 `6ab0233544af9e55`。
- 使用 CryptoJS AES-CBC 和 Pkcs7 padding 解密 Base64 密文。
- `utoDecrypt` 成功时返回解析后的 JSON 值，失败时返回空字符串。
- 新建 `src/omctxCryptoTools.mjs`，导出 `omctxDecrypt`。
- OMCTX 默认密钥为 `RNF2uIWCrz2CttJ7D8vjLRwRoGiYmmWx`，IV 为空字符串。
- OMCTX 将输入中的 `\/` 替换为 `/`，使用 AES-CBC 和 Pkcs7 padding 解密，然后执行 `decodeURIComponent`。
- `omctxDecrypt` 成功时返回普通字符串，失败时返回空字符串。
- `formatOmctxOutput` 将查询参数结果转换为 JSON 输出描述，其他结果保持普通文本。
- `popup.js` 只负责读取输入、调用工具函数以及选择 JSON、普通文本或空结果展示方式。

## 测试

- 使用固定密文验证优投默认密钥和 IV 能还原预期 JSON。
- 使用固定密文验证 OMCTX 默认密钥、空 IV、转义斜杠和 URI 解码逻辑。
- 验证两种工具的空输入和无效输入返回空字符串。
- 运行完整单元测试和 Vite 生产构建。
