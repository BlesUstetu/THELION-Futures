import { createContext, useState } from "react"

export const TradingContext = createContext()

export function TradingProvider({ children }){

const [positions,setPositions] = useState([])
const [openOrders,setOpenOrders] = useState([])
const [orderHistory,setOrderHistory] = useState([])
const [tradeHistory,setTradeHistory] = useState([])

/* order lines for chart */

const [orderLines,setOrderLines] = useState([])

/* =========================
PLACE ORDER
========================= */

function placeOrder(order){

const newOrder={
id:Date.now(),
pair:order.pair,
side:order.side,
price:Number(order.price),
amount:Number(order.amount),
leverage:Number(order.leverage || 1),
status:"OPEN",
time:new Date().toLocaleTimeString()
}

setOpenOrders(prev=>[...prev,newOrder])

setOrderHistory(prev=>[...prev,newOrder])

/* add line to chart */

setOrderLines(prev=>[
...prev,
{
price:newOrder.price,
side:newOrder.side
}
])

}

/* =========================
FILL ORDER
========================= */

function fillOrder(orderId){

const order=openOrders.find(o=>o.id===orderId)

if(!order) return

const position={
...order,
entry:order.price,
pnl:0
}

setPositions(prev=>[...prev,position])

setOpenOrders(prev=>prev.filter(o=>o.id!==orderId))

setTradeHistory(prev=>[...prev,order])

}

/* =========================
CLOSE POSITION
========================= */

function closePosition(positionId){

const pos=positions.find(p=>p.id===positionId)

if(!pos) return

setPositions(prev=>prev.filter(p=>p.id!==positionId))

const closedTrade={
...pos,
closeTime:new Date().toLocaleTimeString(),
status:"CLOSED"
}

setTradeHistory(prev=>[...prev,closedTrade])

}

return(

<TradingContext.Provider

value={{

positions,
openOrders,
orderHistory,
tradeHistory,
orderLines,

placeOrder,
fillOrder,
closePosition

}}

>

{children}

</TradingContext.Provider>

)

}
