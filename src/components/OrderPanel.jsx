import { useState } from "react"
import { useTrading } from "../store/tradingStore"

export default function OrderPanel() {
  const { placeOrder } = useTrading()

  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")

  const handleOrder = (side) => {
    if (!price || !amount) return

    placeOrder({
      side,
      price: parseFloat(price),
      amount: parseFloat(amount)
    })
  }

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

      <button onClick={() => handleOrder("BUY")}>BUY</button>
      <button onClick={() => handleOrder("SELL")}>SELL</button>
    </div>
  )
}
