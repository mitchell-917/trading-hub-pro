<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg" width="120" height="120" alt="Trading Hub Pro Logo" />
</p>

<h1 align="center">🚀 Trading Hub Pro</h1>

<p align="center">
  <strong>The Ultimate Professional Trading Dashboard</strong>
</p>

<p align="center">
  A modern, lightning-fast, and beautifully designed trading platform built with cutting-edge technologies. Monitor markets, manage portfolios, execute trades, and analyze data – all in one powerful application.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-testing">Testing</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tests-1592%20Passing-brightgreen?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/Coverage-High-brightgreen?style=for-the-badge" alt="Coverage" />
  <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge" alt="Build" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

---

## ✨ Features

### 📊 Real-Time Market Dashboard
- **Live Price Tracking** – Monitor cryptocurrency and stock prices in real-time
- **Interactive Charts** – Beautiful candlestick charts with multiple timeframes
- **Sparkline Visualizations** – Quick trend indicators at a glance
- **RSI Indicators** – Technical analysis built right in

### 💼 Portfolio Management
- **Position Tracking** – View all your open positions with P&L
- **Performance Analytics** – Track your portfolio performance over time
- **Allocation Breakdown** – Visual representation of your asset allocation
- **Unrealized/Realized P&L** – Comprehensive profit and loss tracking

### 📈 Market Scanner
- **Multi-Asset Scanning** – Scan across multiple markets simultaneously
- **Customizable Filters** – Filter by price, volume, change percentage
- **Sortable Tables** – Sort by any column for quick analysis
- **Real-Time Updates** – Data refreshes automatically

### 🤖 AI-Powered Signals
- **Smart Trading Signals** – AI-generated buy/sell recommendations
- **Confidence Scores** – See the confidence level of each signal
- **Historical Accuracy** – Track signal performance over time

### ⚡ Order Management
- **Quick Order Entry** – Place market and limit orders instantly
- **Order Book Visualization** – See market depth in real-time
- **Trade History** – Complete log of all your trades
- **Order Modifications** – Edit or cancel pending orders

### 🎯 Additional Features
- **⌨️ Keyboard Shortcuts** – Power user shortcuts for faster navigation
- **🌙 Dark Mode** – Easy on the eyes for late-night trading
- **📱 Responsive Design** – Works on desktop, tablet, and mobile
- **🔔 Toast Notifications** – Real-time alerts for important events
- **⚠️ Error Boundaries** – Graceful error handling throughout

### 🌍 Global Currency Support
- **Auto-Detection** – Automatically detects user's local currency based on geolocation
- **20+ Currencies** – Support for USD, EUR, GBP, JPY, AUD, CAD, CHF, and more
- **Live Conversion** – All prices shown in your preferred currency
- **Easy Switching** – Change currency anytime from settings

### 📊 Advanced Trading Widgets
- **Trading Signals** – AI-powered signals with confidence scores and entry/exit levels
- **Market Heatmap** – Visual overview of market performance across all assets
- **Risk Management** – Portfolio risk analysis with VaR, exposure, and margin tracking
- **Market Depth** – Real-time order book visualization with depth charts

### 💹 Real Market Data APIs
- **Binance API** – Live cryptocurrency prices and trading data
- **CoinGecko API** – Market cap, volume, and coin information
- **Alpha Vantage** – Stock market quotes and historical data
- **Exchange Rate API** – Live forex rates for currency conversion
- **WebSocket Streaming** – Real-time price updates via WebSocket

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 9.x (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mitchell-917/trading-hub-pro.git
cd trading-hub-pro

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be running at **http://localhost:5173** 🎉

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Run ESLint |

---

## 📸 Screenshots

<details>
<summary>📊 Dashboard View</summary>

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Trading Hub Pro                              ⚙️ Settings   │
├─────────────┬───────────────────────────────────────────────────┤
│             │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  Dashboard  │  │ BTC/USD     │ │ ETH/USD     │ │ Total P&L   │ │
│  Portfolio  │  │ $67,234.12  │ │ $3,456.78   │ │ +$12,345    │ │
│  Scanner    │  │ ▲ +2.34%    │ │ ▼ -1.23%    │ │ ▲ +5.67%    │ │
│  Settings   │  └─────────────┘ └─────────────┘ └─────────────┘ │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐ │
│             │  │            📈 Price Chart                   │ │
│             │  │     ╭──╮                          ╭──╮      │ │
│             │  │  ╭──╯  ╰──╮     ╭──────╮      ╭───╯  │      │ │
│             │  │──╯        ╰─────╯      ╰──────╯      ╰──    │ │
│             │  └─────────────────────────────────────────────┘ │
│             │                                                   │
│             │  ┌──────────────────┐ ┌──────────────────────┐  │
│             │  │  🤖 AI Signals   │ │  📋 Order Book       │  │
│             │  │  BTC: BUY (87%)  │ │  Bids     │  Asks    │  │
│             │  │  ETH: HOLD (65%) │ │  67,200   │  67,250  │  │
│             │  └──────────────────┘ └──────────────────────┘  │
└─────────────┴───────────────────────────────────────────────────┘
```

</details>

<details>
<summary>💼 Portfolio View</summary>

```
┌─────────────────────────────────────────────────────────────────┐
│  💼 Portfolio Overview                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Total Value: $125,678.90          Daily P&L: +$3,456.78       │
│  ════════════════════════════════════════════════════════════  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Asset      │ Quantity │ Avg Price │ Current  │ P&L       │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ BTC        │ 1.5      │ $45,000   │ $67,234  │ +$33,351  │ │
│  │ ETH        │ 10.0     │ $2,800    │ $3,456   │ +$6,560   │ │
│  │ SOL        │ 100.0    │ $80       │ $95      │ +$1,500   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

</details>

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ **React** | UI Framework | 19.2.0 |
| 📘 **TypeScript** | Type Safety | 5.9.3 |
| ⚡ **Vite** | Build Tool | 7.2.4 |
| 🎨 **Tailwind CSS** | Styling | 4.1.17 |
| 🔄 **React Router** | Routing | 7.9.6 |
| 📊 **Recharts** | Charts & Graphs | 3.5.1 |
| 🐻 **Zustand** | State Management | 5.0.8 |
| 🔄 **React Query** | Data Fetching | 5.90.11 |
| 🎭 **Framer Motion** | Animations | 12.23.24 |
| 🎯 **Lucide React** | Icons | 0.555.0 |

### Development & Testing
| Technology | Purpose |
|------------|---------|
| 🧪 **Vitest** | Unit & Integration Testing |
| 🎭 **Testing Library** | React Testing Utilities |
| 📏 **ESLint** | Code Linting |
| 🔧 **TypeScript ESLint** | TS-specific Linting |

### CI/CD
| Technology | Purpose |
|------------|---------|
| 🔄 **GitHub Actions** | Automated Pipeline |
| 🛡️ **CodeQL** | Security Analysis |
| 💡 **Lighthouse** | Performance Audits |
| ♿ **Axe** | Accessibility Testing |

---

## 🏗 Architecture

```
trading-hub-pro/
├── 📁 src/
│   ├── 📁 components/          # React components
│   │   ├── 📁 charts/          # Chart components (Candlestick, RSI, Sparkline)
│   │   ├── 📁 layout/          # Layout components (Header, Sidebar, Layout)
│   │   ├── 📁 ui/              # Reusable UI components (Button, Card, Badge)
│   │   └── 📁 widgets/         # Trading widgets (OrderPanel, Watchlist)
│   │
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── useMarketData.ts    # Real-time market data
│   │   ├── useTrading.ts       # Trading operations
│   │   ├── useAISignals.ts     # AI signal processing
│   │   └── useKeyboardShortcuts.tsx
│   │
│   ├── 📁 lib/                 # Utilities & stores
│   │   ├── store.ts            # Zustand state management
│   │   ├── utils.ts            # Utility functions
│   │   └── format.ts           # Formatting helpers
│   │
│   ├── 📁 pages/               # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Portfolio.tsx       # Portfolio management
│   │   ├── MarketScanner.tsx   # Market scanner
│   │   └── Settings.tsx        # User settings
│   │
│   ├── 📁 types/               # TypeScript definitions
│   └── 📁 __tests__/           # Test files
│
├── 📁 .github/workflows/       # CI/CD pipelines
├── 📄 package.json             # Dependencies
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tsconfig.json            # TypeScript configuration
└── 📄 tailwind.config.ts       # Tailwind configuration
```

### State Management

We use **Zustand** for lightweight, performant state management:

```typescript
// Example: Trading Store
const useTradingStore = create<TradingState>((set) => ({
  positions: [],
  orders: [],
  addPosition: (position) => set((state) => ({
    positions: [...state.positions, position]
  })),
  // ... more actions
}))
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   WebSocket  │────▶│  React Query │────▶│   Zustand    │
│   (Real-time)│     │  (Caching)   │     │   (State)    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  Components  │
                                          │   (React)    │
                                          └──────────────┘
```

---

## 🧪 Testing

We take testing seriously. Our test suite includes:

### Test Statistics
- **1,592 tests** across 37 test files
- **100% passing** tests
- **Comprehensive coverage** of components, hooks, and utilities

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run with coverage report
pnpm test:coverage

# Run specific test file
pnpm test src/hooks/__tests__/useTrading.test.ts
```

### Test Categories

| Category | Description | Count |
|----------|-------------|-------|
| 🧩 **Unit Tests** | Individual functions & utilities | 400+ |
| 🔗 **Integration Tests** | Component interactions | 300+ |
| 🎨 **Component Tests** | UI component behavior | 500+ |
| 🪝 **Hook Tests** | Custom React hooks | 200+ |
| 📦 **Store Tests** | Zustand state management | 100+ |

### Example Test

```typescript
describe('useTrading', () => {
  it('should calculate order value correctly', () => {
    const { result } = renderHook(() => useTrading())
    
    const orderValue = result.current.calculateOrderValue({
      price: 50000,
      quantity: 0.5
    })
    
    expect(orderValue).toBe(25000)
  })
})
```

---

## 🔒 Security

- **CodeQL Analysis** – Automated security scanning on every push
- **Dependency Audits** – Regular vulnerability checks
- **Secret Scanning** – No hardcoded secrets in codebase
- **HTTPS Only** – All API calls use secure connections

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open command palette |
| `Ctrl + /` | Toggle sidebar |
| `Ctrl + 1` | Go to Dashboard |
| `Ctrl + 2` | Go to Portfolio |
| `Ctrl + 3` | Go to Scanner |
| `Ctrl + 4` | Go to Settings |
| `Escape` | Close modals |

---

## 🤝 Contributing

We love contributions! Here's how you can help:

### Development Setup

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/trading-hub-pro.git`
3. **Install** dependencies: `pnpm install`
4. **Create** a branch: `git checkout -b feature/amazing-feature`
5. **Make** your changes
6. **Test** your changes: `pnpm test`
7. **Lint** your code: `pnpm lint`
8. **Commit** with a clear message
9. **Push** to your fork
10. **Open** a Pull Request

### Code Style

- Use **TypeScript** for all new code
- Follow existing **ESLint** rules
- Write **tests** for new features
- Use **conventional commits** (`feat:`, `fix:`, `docs:`, etc.)

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://react.dev/) – For the amazing UI library
- [Vite](https://vitejs.dev/) – For the blazing fast build tool
- [Tailwind CSS](https://tailwindcss.com/) – For utility-first CSS
- [Recharts](https://recharts.org/) – For beautiful charts
- [Zustand](https://zustand-demo.pmnd.rs/) – For simple state management
- [Lucide](https://lucide.dev/) – For beautiful icons

---

<p align="center">
  <strong>Built with ❤️ by the Trading Hub Pro Team</strong>
</p>

<p align="center">
  <a href="https://github.com/mitchell-917/trading-hub-pro/issues">Report Bug</a> •
  <a href="https://github.com/mitchell-917/trading-hub-pro/issues">Request Feature</a>
</p>

<p align="center">
  ⭐ Star this repo if you find it useful! ⭐
</p>
