import React, { useState } from "react"
import { useTradingStore } from "../store/tradingStore"

const OrderPanel = () => {
  const { addOrder } = useTradingStore()

  const [price, setPrice] = useState(100)
  const [tp, setTp] = useState(110)
  const [sl, setSl] = useState(90)
  const [amount, setAmount] = useState(1)

  return (
    <div style={{ padding: 10 }}>
      <h3>Order Panel</h3>

      <input value={price} onChange={(e) => setPrice(+e.target.value)} />
      <input value={tp} onChange={(e) => setTp(+e.target.value)} />
      <input value={sl} onChange={(e) => setSl(+e.target.value)} />
      <input value={amount} onChange={(e) => setAmount(+e.target.value)} />

      <button
        onClick={() =>
          addOrder({ type: "buy", price, tp, sl, amount })
        }
      >
        BUY
      </button>

      <button
        onClick={() =>
          addOrder({ type: "sell", price, tp, sl, amount })
        }
      >
        SELL
      </button>
    </div>
  )
}

export default OrderPanel
