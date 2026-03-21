import { TradingProvider } from "./store/tradingStore"
import TradingChart from "./components/TradingChart"
import OrderPanel from "./components/OrderPanel"

export default function App() {
  return (
    <TradingProvider>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 3 }}>
          <TradingChart />
        </div>

        <div style={{ flex: 1 }}>
          <OrderPanel />
        </div>
      </div>
    </TradingProvider>
  )
}
