<div align="center">
  <img src="./assets/images/ss-logo.png" alt="SoberSpend Logo" width="120" />

  <h1>Sober.Spend</h1>
  <p><strong>Stop spending like you're rich.</strong></p>
  <p>An intelligent UPI payment interceptor that forces you to confront your financial reality <em>before</em> you tap pay.</p>

  <p>
    <a href="https://youtu.be/dQw4w9WgXcQ"><strong>🎥 Watch Demo Video</strong></a> ·
    <a href="https://github.com/NormVg/SoberSpend.backend/raw/feat/nuxt-migration-with-ai-sdk/public/SpendSober.pptx"><strong>📊 Download Pitch Deck</strong></a> ·
    <a href="https://github.com/NormVg/SoberSpend.backend"><strong>⚙️ View Backend Repo</strong></a>
  </p>
</div>

---

## 🛑 The Problem
Every budgeting app on the market is fundamentally flawed: they only show you what you've spent **after the damage is already done**. By the time you check your "Monthly Insights," you've already overspent. We need friction *before* the transaction.

## 🟢 The Solution: SoberSpend
SoberSpend sits between you and your wallet. Instead of scanning a QR code directly with Google Pay or PhonePe, you scan it with SoberSpend.

Our engine instantly extracts the merchant and amount, analyzes it against your budget and historical spending personality using Gemini AI, and hits you with a brutally honest **Risk Score** (from `CHILL` to `BROKE`). You are forced to actively acknowledge the financial damage before proceeding to the actual UPI app via deep-link.

## ✨ Features

- **⚡ Real-Time UPI Intercept:** Scan any UPI QR code. SoberSpend decodes the intent, flags the risk, and deep-links you to your preferred payment app only when you're ready.
- **🤖 Smart Budget Advisor:** State your age, income, and financial flaws (e.g., "Weekend Spender"). Gemini AI builds a personalized monthly limit model tailored to your exact psychology.
- **📈 Brutal Live Insights:** Real-time dashboards identifying your "Peak Splurge Hours" and current trajectory. Instead of "You spent ₹500", it tells you "You are 22% over your Dining limit. You're broke."
- **🎯 Intelligent Savings Goals:** Add wishlist items (e.g., PS5, Vacation) and SoberSpend calculates exactly how many days of "chill" spending it takes to afford it organically.
- **🧾 Smart Receipt Parsing:** Point the camera at a physical receipt. The AI extracts the line items and categorizes the spend instantly.

---

## 🛠 Tech Stack

Our product is divided into a robust local client and a scalable edge-ready backend:

### **Client-Side (This Repo)**
- **Framework:** React Native (Expo) & TypeScript
- **Design:** Neo-Brutalism (Custom stylized components)
- **State Management:** Zustand (Expense/Budget/Wishlist stores)
- **Native Modules:** `expo-camera`, `expo-haptics`, Native UPI deep-linking
- **Routing:** Expo Router (File-based navigation)

### **Backend & AI ([Repo Here](https://github.com/NormVg/SoberSpend.backend))**
- **Framework:** Nuxt.js (Nitro Server API)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **AI Core:** Google Gemini (`@google/genai`) for deterministic JSON categorization and psychological budget mapping

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/NormVg/SoberSpend.app.git
cd SoberSpend.app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000   # (Or production backend URL)
```

### 4. Start the Application
```bash
npx expo start
```
Scan the QR code with the Expo Go app on your physical device, or press `a` to run on Android Emulator / `i` to run on iOS Simulator.

---
<div align="center">
  <p>Built with ❤️ by <b>Team SoberSpend</b> for the <b>HS 4.0 Hackathon</b>.</p>
</div>
