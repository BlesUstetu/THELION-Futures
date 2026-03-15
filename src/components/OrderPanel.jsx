import { useState } from "react"

export default function OrderPanel(){

const [price,setPrice]=useState("")
const [amount,setAmount]=useState("")
const [leverage,setLeverage]=useState(10)

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
type="number"
value={leverage}
onChange={(e)=>setLeverage(e.target.value)}
/>

<label>Price</label>

<input
type="number"
value={price}
onChange={(e)=>setPrice(e.target.value)}
placeholder="Price"
/>

<label>Amount</label>

<input
type="number"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
placeholder="Amount"
/>

<div className="order-buttons">

<button className="long">
LONG
</button>

<button className="short">
SHORT
</button>

</div>

</div>

)

}
