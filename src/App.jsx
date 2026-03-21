import StableChart from "./components/StableChart"
import TradingChart from "./components/TradingChart"
import OrderPanel from "./components/OrderPanel"
import BottomTabs from "./components/BottomTabs"
import { TradingProvider } from "./store/tradingStore"

export default function App() {
  return (
    <TradingProvider>
      <div className="app">
        <div className="chart">
          <TradingChart />
        </div>

        <div className="panel">
          <OrderPanel />
        </div>
      </div>
    </TradingProvider>
  )
}
