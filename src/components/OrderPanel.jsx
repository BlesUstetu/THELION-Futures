import { useState } from "react"
import { useTrading } from "../store/tradingStore"

export default function OrderPanel() {
  const { placeOrder } = useTrading()

  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")
  const [leverage, setLeverage] = useState(10)

  const handleOrder = (side) => {
    const p = parseFloat(price)
    const a = parseFloat(amount)

    if (!p || !a) return alert("Isi price & amount")

    placeOrder({
      side,
      price: p,
      amount: a,
      leverage
    })
  }

  return (
    <div className="order-panel">
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

      <input
        placeholder="Leverage"
        value={leverage}
        onChange={e => setLeverage(e.target.value)}
      />

      <button onClick={() => handleOrder("BUY")}>
        BUY
      </button>

      <button onClick={() => handleOrder("SELL")}>
        SELL
      </button>
    </div>
  )
}
