Build a mobile-first web app called **“Sober.Spend”**, a smart financial layer that sits between user intent and UPI payments, helping users make better spending decisions before completing a transaction.

UI deisgn theme will be dark mode with neo brutlist style , with accent color #C54770 and signPainter font for accent like App name and stuff , its in the assets dir, i some rounder corner deisng with no fade shadows type of deign yk tipical neo brutlist style , i want the app minimal , astetic , and smooth , i want the app to be very smooth and responsive , , and use 

---

## 🎯 Core Objective

The app should allow users to:

* Scan or input a payment
* Automatically categorize it
* Show real-time budget impact
* Let the user decide whether to proceed
* Track and visualize spending behavior

This is NOT a traditional expense tracker. It is a **real-time spending decision system**.

---

## 🧠 Core User Flow

1. User opens app → lands on Dashboard
2. User taps “Scan QR” (primary CTA)
3. App simulates or scans a QR → extracts:

   * merchant name
   * amount (if present)
4. App categorizes the expense
5. App shows a **Decision Screen**:

   * category
   * current budget usage
   * projected usage after this transaction
   * warning if near/exceeding limit
6. User chooses:

   * “Pay anyway” → simulate success / redirect
   * “Cancel” → discard
7. App updates dashboard + insights

---

## 📱 Screens to Build

### 1. Dashboard (Home)

* Large text: total spent this month
* Category cards with % usage
* Budget progress bars
* Recent transactions list
* Floating Action Button (FAB) → “Scan QR”

---

### 2. Scan / Add Expense Screen

* Camera QR scanner OR simulated input
* Manual fallback:

  * amount input
  * note / merchant name

---

### 3. Decision Screen (MOST IMPORTANT)

Design this as the core experience.

Display:

* Amount (large, bold)
* Merchant name
* Category
* Budget usage:

  * current %
  * after-transaction %
* Warning states:

  * safe
  * near limit
  * exceeded

Actions:

* “Pay anyway”
* “Cancel”

Tone: clear, direct, slightly serious

---

### 4. Insights Screen

* Key insights:

  * “You spent X% more than last week”
  * “Top category: Food”
* Monthly summary stats

---

### 5. Wishlist Screen (optional but valuable)

* Add item (name + price)
* Show:

  * “You need X days to afford this”

---

## 🧩 Core Features

### Expense Capture

* QR scan (can be mocked)
* Manual entry fallback

---

### Categorization Engine

* Rule-based keyword mapping:

  * zomato, swiggy → Food
  * uber, ola → Travel
  * amazon → Shopping

---

### Budget Engine

* Monthly total budget
* Category-wise limits
* Track:

  * total spent
  * category spent
* Calculate:

  * % used
  * remaining
  * projected usage after new expense

---

### Decision Engine

* Evaluate if transaction:

  * is safe
  * near limit
  * exceeds budget
* Generate warnings accordingly

---

### Insights Engine (basic)

* Compare weekly/monthly spend
* Detect top spending category

---

## 🎨 Design System

Use **Dark Neo-Brutalism style**:

* Background: pure black (#000)
* Text: white
* Accent: one bright color (neon green / electric blue / yellow)
* Bold, large typography
* Hard edges (minimal rounded corners)
* Thick borders for cards
* High contrast
* Minimal gradients

---

## 🔘 Navigation

* Floating Action Button (FAB):

  * Primary action: Scan QR
  * Positioned bottom center
* Simple navigation:

  * Home (Dashboard)
  * Insights
  * Wishlist (optional)

---

## ⚙️ Tech Stack (preferred)

* Frontend: Nuxt 3 (Vue 3)
* Backend: Nitro API routes
* Database: PostgreSQL (or local state for hackathon)
* ORM: Drizzle (optional)
* Charts: lightweight (Chart.js or custom canvas)

---

## 🧱 Data Models

User:

* id
* name
* monthly_budget

Expense:

* id
* amount
* category
* merchant
* date

Category:

* id
* name
* budget_limit

Wishlist:

* id
* item_name
* price

---

## 🚫 Constraints

* Do NOT build full UPI integration
* Simulate payment success if needed
* Keep logic simple and fast
* Focus on UX clarity over feature quantity

---

## 🎯 Success Criteria

* End-to-end flow works smoothly:
  scan → decision → confirm → dashboard
* Decision screen is impactful and clear
* Budget updates correctly
* At least one insight is shown
* UI feels clean, bold, and intentional

---

## 🧠 Product Philosophy

“Help users think before they pay.”

---
