import { TradingProvider } from "./store/tradingStore"
import TradingChart from "./components/TradingChart"

export default function App() {
  console.log("🔥 App LOADED")

  return (
    <TradingProvider>
      <TradingChart />
    </TradingProvider>
  )
}
