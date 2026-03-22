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
    })
  }

  return (
    <div className="order-panel">
      {/* PRICE */}
      <input
        value={price || ""}
        onChange={(e) => setPrice(Number(e.target.value))}
        placeholder="Price"
      />

      {/* AMOUNT */}
      <input
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Amount"
      />

      {/* BUTTON */}
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
