import { useState } from "react"
import { useTrading } from "../store/tradingStore"

export default function OrderPanel() {
  const { placeOrder } = useTrading()

  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")

  return (
    <div style={{ padding: 10 }}>
      <input
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <button onClick={() => placeOrder({ side: "BUY", price: +price, amount: +amount })}>
        BUY
      </button>

      <button onClick={() => placeOrder({ side: "SELL", price: +price, amount: +amount })}>
        SELL
      </button>
    </div>
  )
}
