import { useTradingStore } from "../store/tradingStore"

export default function OrderPanel() {
  const {
    price,
    amount,
    setPrice,
    setAmount,
    addOrder,
  } = useTradingStore()

  const handleOrder = (side) => {
    if (!price) return

    addOrder({
      id: Date.now(),
      price,
      amount,
      side,
      tp: side === "BUY" ? price + 500 : price - 500,
      sl: side === "BUY" ? price - 500 : price + 500,
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
    </div>
  )
}
