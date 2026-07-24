# Identity Test Data Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local identity-test-data generator and a copyable 20-record identity tab.

**Architecture:** Keep generation and ID validation in a pure ES module. The popup renders generated records and handles copy feedback through event delegation.

**Tech Stack:** JavaScript ES modules, Node test runner, Vite 6, Chrome Extension MV3.

## Global Constraints

- Generate only fictional local test data.
- Match the referenced page's field set and number prefixes.
- Generate 20 records per batch.
- Do not add a runtime network dependency.

---

### Task 1: Identity Data Generator

**Files:**
- Create: `src/identityTools.mjs`
- Create: `tests/identityTools.test.mjs`

**Interfaces:**
- Produces: `generateIdentityRecord(random?) => { name, phone, idNumber, bankCard }`
- Produces: `generateIdentityBatch(count?, random?) => IdentityRecord[]`
- Produces: `isValidIdentityNumber(idNumber) => boolean`

- [x] **Step 1: Write failing invariant tests**

Assert that the default batch has 20 records, every record has the four required string fields, phone numbers contain 11 digits, bank cards start with `622202` and contain 19 digits, and every ID passes `isValidIdentityNumber`.

- [x] **Step 2: Verify RED**

Run: `node --test tests/identityTools.test.mjs`
Expected: FAIL because `src/identityTools.mjs` does not exist.

- [x] **Step 3: Implement the generator**

Use local surname, given-name and phone-prefix constants based on the reference page. Build the 17 ID digits from `420101`, a valid random birthday and a three-digit sequence, then append the weighted checksum.

- [x] **Step 4: Verify GREEN**

Run: `node --test tests/identityTools.test.mjs`
Expected: all identity generator tests pass.

### Task 2: Identity Tab UI

**Files:**
- Modify: `popup.html`
- Modify: `src/popup.js`
- Modify: `src/popup.css`

**Interfaces:**
- Consumes: `generateIdentityBatch()`

- [x] **Step 1: Add the tab markup**

Add a `身份证` tab button and a matching content panel with a disclaimer, `换一批` button and `identityBatchList` result container.

- [x] **Step 2: Render and refresh records**

Import `generateIdentityBatch`, render 20 records on initialization, and regenerate the list when `refreshIdentityBatchBtn` is clicked.

- [x] **Step 3: Add copy behavior**

Use one delegated click listener on the list. Copy the selected field value and show temporary `已复制` feedback without changing list dimensions.

- [x] **Step 4: Style the list**

Use a stable two-column grid, divider-based records, compact field rows and responsive overflow handling consistent with the phone tab.

- [x] **Step 5: Verify**

Run: `npm test`
Expected: all tests pass.

Run: `./node_modules/.bin/vite build --outDir /private/tmp/crypto-js-vite-final-identity-build --emptyOutDir`
Expected: production build exits successfully.
