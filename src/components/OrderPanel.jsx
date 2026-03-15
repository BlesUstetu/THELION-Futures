import { useState,useContext } from "react"
import { TradingContext } from "../store/tradingStore"

export default function OrderPanel(){

const { placeOrder } = useContext(TradingContext)

const [price,setPrice]=useState("")
const [amount,setAmount]=useState("")
const [leverage,setLeverage]=useState(10)

function submit(side){

const order={

id:Date.now(),

pair:"BTCUSDT",

side:side,

price:price,

amount:amount,

leverage:leverage,

status:"OPEN",

time:new Date().toLocaleTimeString()

}

placeOrder(order)

}

return(

<div className="order-panel">

<h3>THELION Futures</h3>

<label>Margin Mode</label>

<select>
<option>Cross</option>
<option>Isolated</option>
</select>

<label>Leverage</label>

<input
value={leverage}
onChange={(e)=>setLeverage(e.target.value)}
/>

<label>Price</label>

<input
value={price}
onChange={(e)=>setPrice(e.target.value)}
/>

<label>Amount</label>

<input
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<div className="order-buttons">

<button className="long" onClick={()=>submit("LONG")}>
LONG
</button>

<button className="short" onClick={()=>submit("SHORT")}>
SHORT
</button>

</div>

</div>

)

}
