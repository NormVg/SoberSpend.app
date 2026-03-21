# ✅ _Sober Spend_ — TODO Feature List

## 🔴 P0 — Core (must have)

### 🧾 Expense Capture
- [x] QR scan (or mock scanner)
- [x] Extract merchant name (hardcoded/mock ok)
- [x] Extract amount (fixed QR or manual input)
- [x] Manual add expense fallback

### 🧠 Categorization
- [x] Keyword → category mapping (zomato → food, etc.)
- [x] Default categories:
  - [x] Food
  - [x] Travel
  - [x] Shopping
  - [x] Bills
- [x] Auto assign category on expense

### 💰 Budget Engine
- [x] Set monthly total budget
- [x] Set per category limits
- [x] Track total spent
- [x] Track category wise spent
- [x] Calculate % usage
- [x] Compute post transaction impact

### ⚠️ Decision Layer (Hero Feature)
- [x] Show category before payment
- [x] Show current % used
- [x] Show “after this” % prediction
- [x] Warning states:
  - [x] Safe (<70%)
  - [x] Near limit (70–90%)
  - [x] Exceeded (>100%)
- [x] Buttons:
  - [x] “Pay anyway”
  - [x] “Cancel”

### 📊 Dashboard
- [x] Total spent (this month)
- [x] Category cards with usage %
- [x] Simple graph (daily/weekly)
- [x] Recent transactions list

### 💾 Data Handling
- [x] Store expenses (local DB / state)
- [x] Store budgets
- [x] Update data after each transaction

---

## 🟠 P1 — High Impact (add if time)

### 🔍 Smart Insights
- [x] “You spent X% more than last week”
- [x] “Food is your highest category”
- [x] “You are close to your limit”

### 📲 Payment Simulation
- [x] Success screen after confirm (Haptic feedback + auto-return to dashboard)
- [x] (Optional) UPI deeplink redirect (Implemented for non-demo mode)

### 🎯 Financial Personality (light version)
- [ ] 2–3 onboarding questions
- [ ] Assign label:
  - [ ] “Saver”
  - [ ] “Balanced”
  - [ ] “Spender”

### 📦 Monthly Report (mini wrapped)
- [x] Top category (Visible in Insights & Dashboard)
- [x] Total spend
- [x] 1 insight line (Hard truth banners in Insights)

---

## 🟡 P2 — Bonus (only if everything done)

### 🛍 Wishlist System
- [x] Add item (name + price)
- [x] Show:
  - [x] “X days needed to afford”

### ⚙️ Modes
- [ ] Chill mode (soft warnings)
- [ ] Strict mode (strong alerts)
*(Note: We built a "Demo Mode" instead for testing)*

### 🎨 UI Polish (important)
- [x] Dark theme (pure black)
- [x] Bold typography (brutalist style)
- [x] Strong contrast cards
- [x] Smooth transitions (fast, not fancy)

---

## 🚫 DO NOT BUILD (time traps)
- [x] Full UPI integration (Avoided, used deep linking)
- [x] Complex AI models (Avoided, used fast matching logic)
- [x] Multi-device sync (Avoided, used local Zustand store)
- [x] Over-detailed analytics (Avoided, kept it high-level)

---

## 🎯 Final Checklist (before demo)
- [x] End-to-end flow works (scan → decision → confirm → dashboard)
- [x] Decision screen looks clean + impactful
- [x] At least 1 insight working
- [x] No broken UI
- [ ] Demo script practiced
