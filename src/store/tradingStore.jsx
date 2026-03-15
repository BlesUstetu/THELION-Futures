import { createContext, useState, useEffect } from "react"

export const TradingContext = createContext()

export function TradingProvider({ children }){

const [positions,setPositions] = useState([])
const [openOrders,setOpenOrders] = useState([])
const [orderHistory,setOrderHistory] = useState([])
const [tradeHistory,setTradeHistory] = useState([])

/* existing */

const [orderLines,setOrderLines] = useState([])

/* new features */

const [tpLines,setTpLines] = useState([])
const [slLines,setSlLines] = useState([])
const [liquidationLines,setLiquidationLines] = useState([])
const [livePrice,setLivePrice] = useState(null)

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

/* order line */

setOrderLines(prev=>[
...prev,
{
price:newOrder.price,
side:newOrder.side
}
])

/* TP line */

setTpLines(prev=>[
...prev,
{
price:newOrder.price * 1.02,
side:"TP"
}
])

/* SL line */

setSlLines(prev=>[
...prev,
{
price:newOrder.price * 0.98,
side:"SL"
}
])

/* liquidation example */

setLiquidationLines(prev=>[
...prev,
{
price:newOrder.price * 0.9,
side:"LIQ"
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

/* =========================
LIVE PRICE FEED
========================= */

useEffect(()=>{

const ws = new WebSocket(
"wss://stream.binance.com:9443/ws/btcusdt@trade"
)

ws.onmessage=(event)=>{

const data = JSON.parse(event.data)

setLivePrice(Number(data.p))

}

return ()=>ws.close()

},[])

return(

<TradingContext.Provider

value={{

positions,
openOrders,
orderHistory,
tradeHistory,

orderLines,
tpLines,
slLines,
liquidationLines,
livePrice,

placeOrder,
fillOrder,
closePosition,

setOrderLines

}}

>

{children}

</TradingContext.Provider>

)

}
