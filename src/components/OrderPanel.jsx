import { useState,useContext } from "react"
import { TradingContext } from "../store/tradingStore.jsx"

export default function OrderPanel(){

const { placeOrder } = useContext(TradingContext)

const [price,setPrice] = useState("")
const [amount,setAmount] = useState("")
const [leverage,setLeverage] = useState(10)

function submit(side){

const p = Number(price)
const a = Number(amount)

if(!p || !a) return

placeOrder({
pair:"BTCUSDT",
side,
price:p,
amount:a,
leverage
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

<div className="order-buttons">

<button className="buy" onClick={()=>submit("BUY")}>
BUY
</button>

<button className="sell" onClick={()=>submit("SELL")}>
SELL
</button>

</div>

</div>

)

}
