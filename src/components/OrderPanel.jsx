import { useState,useContext } from "react"
import { TradingContext } from "../store/tradingStore"

export default function OrderPanel(){

  const {placeOrder}=useContext(TradingContext)

  const [price,setPrice]=useState("")
  const [amount,setAmount]=useState("")
  const [leverage,setLeverage]=useState(10)

  function submit(side){

    if(!price||!amount) return

    placeOrder({

      pair:"BTCUSDT",
      side:side,
      price:price,
      amount:amount,
      leverage:leverage

    })

    setPrice("")
    setAmount("")

  }

  return(

    <div className="order-panel">

      <h3>Order</h3>

      <input
      placeholder="Price"
      value={price}
      onChange={e=>setPrice(e.target.value)}
      />

      <input
      placeholder="Amount"
      value={amount}
      onChange={e=>setAmount(e.target.value)}
      />

      <input
      placeholder="Leverage"
      value={leverage}
      onChange={e=>setLeverage(e.target.value)}
      />

      <button
      className="buy"
      onClick={()=>submit("BUY")}
      >
      Buy
      </button>

      <button
      className="sell"
      onClick={()=>submit("SELL")}
      >
      Sell
      </button>

    </div>

  )

}
