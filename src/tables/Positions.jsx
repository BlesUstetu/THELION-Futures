import { useContext } from "react"
import { TradingContext } from "../store/tradingStore"

export default function Positions(){

const { positions } = useContext(TradingContext)

return(

<table>

<thead>

<tr>
<th>Pair</th>
<th>Side</th>
<th>Entry</th>
<th>Size</th>
</tr>

</thead>

<tbody>

{positions.map(p=>(

<tr key={p.id}>

<td>{p.pair}</td>
<td>{p.side}</td>
<td>{p.price}</td>
<td>{p.amount}</td>

</tr>

))}

</tbody>

</table>

)

}
