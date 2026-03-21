import { TradingProvider, useTrading } from "./store/tradingStore"
import TradingChart from "./components/TradingChart"
import OrderPanel from "./components/OrderPanel"

function Controls() {
  const { setPair, setTimeframe } = useTrading()

  return (
    <div style={{ position: "absolute", top: 10, left: 10 }}>
      {["btcusdt", "ethusdt", "solusdt"].map(p => (
        <button key={p} onClick={() => setPair(p)}>
          {p}
        </button>
      ))}

      {["1m", "5m", "15m", "1h"].map(tf => (
        <button key={tf} onClick={() => setTimeframe(tf)}>
          {tf}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <TradingProvider>
      <Controls />

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
