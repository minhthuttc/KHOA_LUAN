# ♻️ REFACTOR PAYMENT LOGIC - DESIGN DOCUMENT

## 🎯 PROBLEM STATEMENT

### Inconsistent State Found:
```sql
transaction_id = "32cb7a18bb984944b05f46885f41c316"  -- PayOS link exists
payment_status = "PENDING"                          -- But not paid
paid_at = NULL                                      -- No timestamp
```

**This state should NEVER exist!**

---

## 🚫 FORBIDDEN STATES

### State 1: Transaction without payment
```sql
transaction_id != NULL
AND payment_status = 'PENDING'
```
**Reason**: If transaction_id exists, payment link was created. If user paid, status should be PAID.

### State 2: Transaction without timestamp
```sql
transaction_id != NULL
AND payment_status = 'PAID'
AND paid_at IS NULL
```
**Reason**: If PAID, must have timestamp.

### State 3: Timestamp without PAID status
```sql
paid_at IS NOT NULL
AND payment_status != 'PAID'
```
**Reason**: If timestamp exists, status must be PAID.

---

## ✅ SOLUTION: CENTRALIZED HANDLER

### Design Rule:
**ONE function to handle payment success**

```javascript
handlePaymentSuccess(orderId, transactionId, options)
```

### All payment confirmations MUST use this function:
1. ✅ PayOS webhook
2. ✅ Manual approval (quick-approve.js)
3. ✅ Test webhook (test-webhook.js)
4. ✅ Any future payment callback

---

## 📁 NEW FILE STRUCTURE

### Created: `backend/services/paymentHandler.js`

**Exports**:
- `handlePaymentSuccess()` - Central payment handler
- `checkPaymentConsistency()` - Validate payment state

**Features**:
- ✅ ONE database transaction for consistency
- ✅ Idempotent (safe to call multiple times)
- ✅ Automatic inconsistency detection
- ✅ Automatic SIM status update
- ✅ Comprehensive logging

---

## 🔧 REFACTORED FILES

### 1. `backend/services/paymentHandler.js` (NEW)

**Core function**:
```javascript
async function handlePaymentSuccess(orderId, transactionId, options = {}) {
  // 1. Start database transaction
  await connection.beginTransaction();
  
  // 2. Get order details
  const [orders] = await connection.query(...);
  
  // 3. Check if already PAID (idempotency)
  if (order.payment_status === 'PAID') {
    return { success: true, alreadyPaid: true };
  }
  
  // 4. Detect inconsistent state
  if (order.transaction_id && order.payment_status === 'PENDING') {
    console.error('🚨 DATABASE INCONSISTENCY DETECTED!');
  }
  
  // 5. Update order to PAID
  await connection.query(`
    UPDATE don_hang SET
      payment_status = 'PAID',
      paid_at = NOW(),
      transaction_id = ?,
      trang_thai = 'Đã duyệt',  -- Optional auto-approve
      ngay_duyet = NOW()
    WHERE ma_don_hang = ?
  `);
  
  // 6. Update SIM to "Đã bán"
  await connection.query(`
    UPDATE the_sim SET trang_thai = 'Đã bán' WHERE so_sim = ?
  `);
  
  // 7. Commit transaction
  await connection.commit();
  
  return { success: true, data: {...} };
}
```

**Consistency checker**:
```javascript
async function checkPaymentConsistency(orderId) {
  // Check for FORBIDDEN states
  // Log errors if found
  // Return consistency report
}
```

---

### 2. `backend/index.js` (REFACTORED)

**Before** (webhook - duplicated logic):
```javascript
// Manual UPDATE queries in webhook
await pool.query('UPDATE don_hang SET payment_status = ...');
await pool.query('UPDATE the_sim SET trang_thai = ...');
```

**After** (webhook - uses handler):
```javascript
const { handlePaymentSuccess } = require('./services/paymentHandler');

app.post('/api/payos/webhook', async (req, res) => {
  // ... verify webhook ...
  
  // Use centralized handler
  const result = await handlePaymentSuccess(
    orderCode, 
    reference || paymentLinkId,
    { source: 'payos-webhook', autoApprove: true }
  );
  
  res.json({ success: true, data: result.data });
});
```

**Payment status API** (added consistency check):
```javascript
app.get('/api/order/payment-status/:orderId', async (req, res) => {
  // Check consistency FIRST
  const consistencyCheck = await checkPaymentConsistency(orderId);
  
  if (!consistencyCheck.consistent) {
    console.error('🚨 INCONSISTENT STATE DETECTED!');
  }
  
  // ... return payment status ...
});
```

---

### 3. `backend/quick-approve.js` (REFACTORED)

**Before** (manual UPDATE):
```javascript
await pool.query(
  'UPDATE don_hang SET payment_status = ?, paid_at = NOW(), ...',
  ['PAID', transactionId, orderId]
);
await pool.query(
  'UPDATE the_sim SET trang_thai = ? WHERE so_sim = ?',
  ['Đã bán', simNumber]
);
```

**After** (uses handler):
```javascript
const { handlePaymentSuccess } = require('./services/paymentHandler');

const result = await handlePaymentSuccess(orderId, transactionId, {
  source: 'manual-approve',
  autoApprove: true
});
```

---

### 4. `backend/test-webhook.js` (REFACTORED)

Now calls webhook endpoint which uses `handlePaymentSuccess()` internally.

**Reference format**: `TEST_` + timestamp
- Automatically bypasses signature verification
- Logged as `source: 'test-webhook'`

---

### 5. `backend/check-consistency.js` (NEW)

Script to check ALL orders for inconsistent states.

**Usage**:
```bash
node check-consistency.js
```

**Output**:
```
📊 Checking 50 recent orders...

📈 SUMMARY:
   ✅ Consistent orders: 47
   ❌ Inconsistent orders: 3

🚨 === INCONSISTENT ORDERS FOUND ===

❌ Order #29 - SIM: 0322042003
   payment_status: PENDING
   paid_at: null
   transaction_id: 32cb7a18bb984944b05f46885f41c316
   Issues:
      - transaction_id exists BUT payment_status=PENDING [ERROR]

🔧 TO FIX THESE ORDERS:
   node quick-approve.js 29
```

---

## 🔄 WORKFLOW AFTER REFACTOR

### Payment Success Flow:

```
PayOS confirms payment
       ↓
Webhook received
       ↓
handlePaymentSuccess(orderId, transactionId)
       ↓
BEGIN TRANSACTION
       ↓
Check if already PAID (idempotency) ──→ Already PAID? Return success
       ↓ No
Detect inconsistency? ──→ Yes ──→ Log error, fix automatically
       ↓ No
UPDATE don_hang SET payment_status='PAID', paid_at=NOW()
       ↓
UPDATE the_sim SET trang_thai='Đã bán'
       ↓
COMMIT TRANSACTION
       ↓
Return success
       ↓
Frontend polling detects PAID
       ↓
Success modal opens
```

---

## ✅ BENEFITS OF REFACTOR

### 1. Single Source of Truth
- ✅ ONE function handles payment success
- ✅ No duplicated logic
- ✅ Easy to maintain

### 2. Database Consistency
- ✅ ONE database transaction
- ✅ Atomic updates (all or nothing)
- ✅ Impossible to have partial updates

### 3. Automatic Detection
- ✅ Detects inconsistent states
- ✅ Logs errors automatically
- ✅ Fixes states automatically

### 4. Idempotency
- ✅ Safe to call multiple times
- ✅ No duplicate processing
- ✅ Webhook retries don't cause issues

### 5. Comprehensive Logging
- ✅ Every payment success logged
- ✅ Source tracking (webhook, manual, test)
- ✅ Easy to debug

---

## 🧪 TESTING AFTER REFACTOR

### Test 1: Check existing inconsistencies
```bash
cd backend
node check-consistency.js
```

### Test 2: Fix inconsistent order
```bash
node quick-approve.js 29
```

**Expected**:
- ✅ Uses `handlePaymentSuccess()`
- ✅ ONE transaction updates both order & SIM
- ✅ No inconsistent state possible

### Test 3: Simulate webhook
```bash
node test-webhook.js 29
```

**Expected**:
- ✅ Calls webhook endpoint
- ✅ Webhook uses `handlePaymentSuccess()`
- ✅ Same result as quick-approve

### Test 4: Verify consistency after fix
```bash
node check-consistency.js
```

**Expected**:
```
✅ All orders are consistent! No issues found.
```

### Test 5: Full flow test
```bash
node test-full-flow.js 29
```

**Expected**:
```
🎉🎉🎉 ALL TESTS PASSED!
✅ Database payment_status = PAID
✅ Database paid_at is set
✅ API returns paymentStatus: PAID
```

---

## 📊 BEFORE vs AFTER

### Before Refactor:
```
3 different places update payment_status:
1. Webhook (backend/index.js line 1265)
2. quick-approve.js (line 58)
3. test-webhook.js (indirectly)

❌ Duplicated logic
❌ Possible race conditions
❌ Inconsistent states possible
❌ Hard to maintain
```

### After Refactor:
```
1 centralized function:
handlePaymentSuccess() in paymentHandler.js

✅ Single source of truth
✅ Atomic transactions
✅ Consistent states guaranteed
✅ Easy to maintain
✅ Automatic detection & fixing
```

---

## 🎓 KEY DESIGN PRINCIPLES

### 1. Single Responsibility
`handlePaymentSuccess()` does ONE thing: mark payment as successful

### 2. Atomicity
Database transaction ensures all-or-nothing updates

### 3. Idempotency
Safe to call multiple times with same parameters

### 4. Defensive Programming
Detect and log inconsistencies, fix automatically

### 5. Separation of Concerns
Payment logic separate from webhook/API logic

---

## 🚀 MIGRATION STEPS

### Step 1: Deploy new code
```bash
git add backend/services/paymentHandler.js
git add backend/index.js backend/quick-approve.js backend/test-webhook.js
git commit -m "Refactor: Centralize payment success handler"
git push
```

### Step 2: Check for inconsistencies
```bash
node check-consistency.js
```

### Step 3: Fix any found
```bash
node quick-approve.js <order_id>
```

### Step 4: Verify
```bash
node check-consistency.js  # Should show all consistent
```

### Step 5: Monitor
- Watch backend logs for "🚨 DATABASE INCONSISTENCY DETECTED"
- Should never appear in production with new code

---

## 📝 SUMMARY

✅ **Created**: `paymentHandler.js` - Central payment handler  
✅ **Refactored**: `index.js`, `quick-approve.js`, `test-webhook.js`  
✅ **Added**: Consistency checker and detection  
✅ **Prevented**: Inconsistent states through atomic transactions  
✅ **Ensured**: Single source of truth for payment success  

**Result**: Robust, maintainable payment system with guaranteed consistency.
