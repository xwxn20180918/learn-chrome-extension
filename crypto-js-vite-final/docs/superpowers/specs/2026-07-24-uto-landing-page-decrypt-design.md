# 优投落地页解密设计

## 目标

在“加解密数据”Tab 中增加“优投落地页解密”按钮，使用固定默认密钥和 IV 解密 Base64 格式的 AES-CBC 密文，并通过现有输出区域展示解密后的 JSON。

## 交互

- 新按钮放在现有“优投解密”按钮附近，并沿用优投按钮的视觉样式。
- 点击按钮后读取现有 `inputText` 输入框内容。
- 解密成功时，将结果序列化后交给现有 JSON Viewer 展示。
- 输入为空、密文无效、解密失败或明文不是合法 JSON 时，清空输出，不弹出错误提示。

## 实现

- 新建 `src/utoCryptoTools.mjs`，导出 `utoDecrypt`。
- 默认密钥为 `DD1Eovf4QTWRWqpT0o5fQzvunrR49jvL`。
- 默认 IV 为 `6ab0233544af9e55`。
- 使用 CryptoJS AES-CBC 和 Pkcs7 padding 解密 Base64 密文。
- `utoDecrypt` 成功时返回解析后的 JSON 值，失败时返回空字符串。
- `popup.js` 只负责读取输入、调用工具函数以及选择 JSON 或空结果展示方式。

## 测试

- 使用固定密文验证默认密钥和 IV 能还原预期 JSON。
- 验证空输入返回空字符串。
- 验证无效密文和非 JSON 明文返回空字符串。
- 运行完整单元测试和 Vite 生产构建。

