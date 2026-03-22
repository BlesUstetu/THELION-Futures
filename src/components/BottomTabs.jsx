import { useState } from "react"

import Positions from "../tables/Positions"
import OpenOrders from "../tables/OpenOrders"
import OrderHistory from "../tables/OrderHistory"
import TradeHistory from "../tables/TradeHistory"

export default function BottomTabs(){

const [tab,setTab]=useState("positions")

return(

<div className="tabs">

<div className="tab-menu">

<button onClick={()=>setTab("positions")}>POSITIONS</button>

<button onClick={()=>setTab("open")}>OPEN ORDERS</button>

<button onClick={()=>setTab("orders")}>ORDER HISTORY</button>

<button onClick={()=>setTab("trades")}>TRADE HISTORY</button>

</div>

<div>

{tab==="positions" && <Positions/>}

{tab==="open" && <OpenOrders/>}

{tab==="orders" && <OrderHistory/>}

{tab==="trades" && <TradeHistory/>}

</div>

</div>

)

}
