import { createContext, useState } from "react"

export const TradingContext = createContext()

export function TradingProvider({children}){

const [positions,setPositions]=useState([])
const [openOrders,setOpenOrders]=useState([])
const [orderHistory,setOrderHistory]=useState([])
const [tradeHistory,setTradeHistory]=useState([])

function placeOrder(order){

setOpenOrders(prev=>[...prev,order])

setOrderHistory(prev=>[...prev,order])

}

function fillOrder(order){

setOpenOrders(prev=>prev.filter(o=>o.id!==order.id))

setPositions(prev=>[...prev,order])

setTradeHistory(prev=>[...prev,order])

}

return(

<TradingContext.Provider value={{

positions,
openOrders,
orderHistory,
tradeHistory,

placeOrder,
fillOrder

}}>

{children}

</TradingContext.Provider>

)

}
