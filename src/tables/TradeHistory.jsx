import { useContext } from "react"
import { TradingContext } from "../store/tradingStore"

export default function TradeHistory(){

const { tradeHistory } = useContext(TradingContext)

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

{tradeHistory.map(t=>(

<tr key={t.id}>

<td>{t.pair}</td>
<td>{t.side}</td>
<td>{t.price}</td>
<td>{t.amount}</td>
<td>{t.time}</td>

</tr>

))}

</tbody>

</table>

)

}
