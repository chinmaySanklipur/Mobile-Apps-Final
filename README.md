# GAMBIL — No-Stakes Gambling Simulator
**Authors:** Vivaan Bhujabal, Sudev Raj, Chinmay Sanklipur

> Want to quit gambling? Download Gambil today!

Gambil is a no-stakes gambling simulator built for recovering gambling addicts.
Engage in the most popular forms of gambling for **free** — no real money, ever.

---

## Features

| Screen | Description |
|--------|-------------|
| 🏠 **Home** | Daily lottery (150–450G), balance display, session stats, built-in helpline |
| 🎁 **Case Opening** | Animated spring reel, 5 case tiers (50G–1500G), weighted drops, auto-inventory |
| 🎰 **Slot Machine** | 3-reel staggered reveal, 5 bet sizes, paytable ×0.5–×50, win shake animation |
| 🎫 **Scratch Cards** | 3×3 tap-to-reveal grid, 6 prize tiers (0×–100×), Reveal All, instant payouts |
| 🎒 **Inventory** | Sort by rarity/value/name, stack counts, sell flow, total portfolio value |
| 🛒 **Shop** | Buy any case, satire G-Coin packs (no real purchases), live free-item countdown |

---

## Running in CodeHS Sandbox (Primary)

1. Open **CodeHS** and create a new **React Native** project
2. Delete all default content in `App.js`
3. Paste the full contents of `App.js` from this folder
4. Click **Run** — no installs, no config needed

---

## Running Locally via Expo / Metro

**Prerequisites:** Node.js 18+

```bash
npm install          # install dependencies

npm run web          # browser preview (fastest)
npm start            # Expo Go on physical device (scan QR)
npm run android      # Android emulator
npm run ios          # iOS simulator (macOS only)
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React Native 0.73 | Cross-platform UI |
| Expo ~50 | Metro bundler, smartphone deploy |
| React 18 | Hooks — useState, useEffect, useRef |
| CodeHS / VS Code | IDE |

**Zero external libraries.** All animation via React Native `Animated` API.

---

## Architecture

```
App()  ←  root; owns all shared state
  ├─ balance, inventory, stats     (lifted state, passed as props)
  ├─ HomeScreen
  ├─ CasesScreen
  ├─ SlotsScreen
  ├─ ScratchScreen
  ├─ InventoryScreen
  ├─ ShopScreen
  ├─ Header    (shared component)
  └─ TabBar    (shared component)
```

Pattern: **lifted state + stateless screen components + prop drilling**.

---

## Drop Weights

```
Common:    40%   Rare:    15%   Legendary: 3%
Uncommon:  25%   Epic:    10%
```

Same engine powers Cases, Slots, and Scratch Cards.

---

## Attribution

React / React Native / Expo — all MIT licensed.
No unlicensed assets. No external APIs. No real money.

---

🆘 **National Problem Gambling Helpline: 1-800-522-4700**
Free · Confidential · 24/7 · ncpgambling.org

*This app is satire. Gambil v1.0 — Mobile Application Development Final Project*
