import { createContext, useState } from "react"

export const TradingContext = createContext()

export function TradingProvider({ children }){

const [positions,setPositions] = useState([])
const [openOrders,setOpenOrders] = useState([])
const [orderHistory,setOrderHistory] = useState([])
const [tradeHistory,setTradeHistory] = useState([])

const [orderLines,setOrderLines] = useState([])
const [tpLines,setTpLines] = useState([])
const [slLines,setSlLines] = useState([])
const [liquidationLines,setLiquidationLines] = useState([])

const [livePrice,setLivePrice] = useState(null)

/* =========================
PLACE ORDER
========================= */

function placeOrder(order){

const id = Date.now()

const newOrder={
id,
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

setOrderLines(prev=>[
...prev,
{
orderId:id,
price:newOrder.price,
side:newOrder.side
}
])

setTpLines(prev=>[
...prev,
{
orderId:id,
price:newOrder.price * 1.02
}
])

setSlLines(prev=>[
...prev,
{
orderId:id,
price:newOrder.price * 0.98
}
])

}

/* =========================
CANCEL ORDER
========================= */

function cancelOrder(id){

setOpenOrders(prev=>prev.filter(o=>o.id!==id))

setOrderLines(prev=>prev.filter(l=>l.orderId!==id))
setTpLines(prev=>prev.filter(l=>l.orderId!==id))
setSlLines(prev=>prev.filter(l=>l.orderId!==id))

}

/* =========================
FILL ORDER
========================= */

function fillOrder(order){

setPositions(prev=>[...prev,order])

setTradeHistory(prev=>[
...prev,
{
...order,
time:new Date().toLocaleTimeString()
}
])

cancelOrder(order.id)

}

/* ========================= */

return(

<TradingContext.Provider value={{

positions,
openOrders,
orderHistory,
tradeHistory,

orderLines,
tpLines,
slLines,
liquidationLines,

livePrice,
setLivePrice,

placeOrder,
cancelOrder,
fillOrder

}}>

{children}

</TradingContext.Provider>

)

}
