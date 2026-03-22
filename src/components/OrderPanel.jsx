import { useTradingStore } from "../store/tradingStore"

export default function OrderPanel() {
  const {
    price,
    amount,
    setPrice,
    setAmount,
    addOrder,
    orders
  } = useTradingStore()

  const handleOrder = (side) => {
    if (!price) return

    addOrder({
      id: Date.now(),
      price: Number(price),     // 🔥 WAJIB
      amount: Number(amount),   // 🔥 WAJIB
      side,
      tp: side === "BUY" ? price + 500 : price - 500,
      sl: side === "BUY" ? price - 500 : price + 500,
      pnl: 0,
      liquidation: 0,
    })
  }

  return (
    <div className="order-panel">
      <input
        value={price || ""}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="Price"
      />

      <input
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount"
      />

      <div className="flex">
        <button onClick={() => handleOrder("BUY")} className="buy">
          Buy
        </button>

        <button onClick={() => handleOrder("SELL")} className="sell">
          Sell
        </button>
      </div>

      {/* INFO */}
      {orders.map((o) => (
        <div key={o.id}>
          <div>PNL: {o.pnl?.toFixed(2)}</div>
          <div>LIQ: {o.liquidation?.toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}
