# Popup Decrypt Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tested UTO landing-page and OMCTX decrypt buttons to the existing encryption-data tab.

**Architecture:** Keep each protocol in a focused CryptoJS utility module. The popup event handlers only read the shared input, invoke the utility, and route JSON or text into the existing output renderer.

**Tech Stack:** JavaScript ES modules, CryptoJS 4.2, Node test runner, Vite 6.

## Global Constraints

- UTO defaults: key `DD1Eovf4QTWRWqpT0o5fQzvunrR49jvL`, IV `6ab0233544af9e55`, AES-CBC, Pkcs7, Base64 input.
- OMCTX defaults: key `RNF2uIWCrz2CttJ7D8vjLRwRoGiYmmWx`, empty IV, AES-CBC, Pkcs7.
- Empty or invalid input returns `""` and does not trigger an alert.
- UTO success renders through the JSON Viewer; OMCTX query-parameter output renders through the JSON Viewer and other OMCTX output renders as text.

---

### Task 1: UTO Landing-Page Decrypt Utility

**Files:**
- Create: `src/utoCryptoTools.mjs`
- Create: `tests/utoCryptoTools.test.mjs`

**Interfaces:**
- Produces: `utoDecrypt(data, key?, iv?) => object | array | primitive | ""`

- [x] **Step 1: Write failing tests**

```js
assert.deepEqual(
  utoDecrypt('fIUbtx2FwHnm3KV4I2mAGU63FiilCTW0FYa1PR3Zy8k='),
  { name: '测试', count: 2 },
);
assert.equal(utoDecrypt(''), '');
assert.equal(utoDecrypt('invalid'), '');
```

- [x] **Step 2: Verify RED**

Run: `node --test tests/utoCryptoTools.test.mjs`
Expected: FAIL because `src/utoCryptoTools.mjs` does not exist.

- [x] **Step 3: Implement the utility**

Use `CryptoJS.AES.decrypt` with UTF-8 parsed key and IV, CBC mode and Pkcs7 padding. Parse the UTF-8 plaintext with `JSON.parse`; catch all failures and return `""`.

- [x] **Step 4: Verify GREEN**

Run: `node --test tests/utoCryptoTools.test.mjs`
Expected: all UTO tests pass.

### Task 2: OMCTX Decrypt Utility

**Files:**
- Create: `src/omctxCryptoTools.mjs`
- Create: `tests/omctxCryptoTools.test.mjs`

**Interfaces:**
- Produces: `omctxDecrypt(data, key?) => string`
- Produces: `formatOmctxOutput(data) => { content: string, isJSON: boolean }`

- [x] **Step 1: Write failing tests**

```js
assert.equal(
  omctxDecrypt('iL8hBYhCXvgqRWhBBRm5vzd1Z3+6183\\/9JiylvNiWAE='),
  'OMCTX 测试/ok',
);
assert.equal(omctxDecrypt(''), '');
assert.equal(omctxDecrypt('invalid'), '');
```

- [x] **Step 2: Verify RED**

Run: `node --test tests/omctxCryptoTools.test.mjs`
Expected: FAIL because `src/omctxCryptoTools.mjs` does not exist.

- [x] **Step 3: Implement the utility**

Normalize escaped slashes, decrypt with the UTF-8 parsed key, empty UTF-8 IV, CBC mode and Pkcs7 padding, then return `decodeURIComponent` of the UTF-8 plaintext. Catch all failures and return `""`.

Convert query-parameter output to a JSON string with `URLSearchParams` and leave other text unchanged.

- [x] **Step 4: Verify GREEN**

Run: `node --test tests/omctxCryptoTools.test.mjs`
Expected: all OMCTX tests pass.

### Task 3: Popup Integration

**Files:**
- Modify: `popup.html`
- Modify: `src/popup.js`
- Modify: `src/popup.css`

**Interfaces:**
- Consumes: `utoDecrypt` and `omctxDecrypt`

- [x] **Step 1: Add buttons**

Add `#utoDecrypt` with label `优投落地页解密` and `#omctxDecrypt` with label `OMCTX解密` to the existing button grid.

- [x] **Step 2: Add event handlers**

Import both utilities. UTO passes `JSON.stringify(result)` to `showOutput(..., true)` when successful and clears output on failure. OMCTX passes `formatOmctxOutput(result).content` and its `isJSON` flag to `showOutput`.

- [x] **Step 3: Extend button styling**

Include `#utoDecrypt` in the existing UTO/优投 selector and give `#omctxDecrypt` a stable button style consistent with the current grid.

- [x] **Step 4: Verify the complete change**

Run: `npm test`
Expected: all tests pass.

Run: `./node_modules/.bin/vite build --outDir /private/tmp/crypto-js-vite-final-popup-decrypt-build --emptyOutDir`
Expected: production build exits successfully.
