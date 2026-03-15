import { useContext } from "react"
import { TradingContext } from "../store/tradingStore"

export default function OpenOrders(){

const { openOrders } = useContext(TradingContext)

return(

<table>

<thead>
<tr>
<th>Pair</th>
<th>Side</th>
<th>Price</th>
<th>Amount</th>
<th>Status</th>
</tr>
</thead>

<tbody>

{openOrders.map(o=>(

<tr key={o.id}>

<td>{o.pair}</td>
<td>{o.side}</td>
<td>{o.price}</td>
<td>{o.amount}</td>
<td>{o.status}</td>

</tr>

))}

</tbody>

</table>

)

}
