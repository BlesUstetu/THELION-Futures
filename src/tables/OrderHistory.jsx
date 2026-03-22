import { useContext } from "react"
import { TradingContext } from "../store/tradingStore"

export default function OrderHistory(){

const { orderHistory } = useContext(TradingContext)

return(

<table>

<thead>
<tr>
<th>Pair</th>
<th>Side</th>
<th>Price</th>
<th>Amount</th>
<th>Time</th>
</tr>
</thead>

<tbody>

{orderHistory.map(o=>(

<tr key={o.id}>

<td>{o.pair}</td>
<td>{o.side}</td>
<td>{o.price}</td>
<td>{o.amount}</td>
<td>{o.time}</td>

</tr>

))}

</tbody>

</table>

)

}
