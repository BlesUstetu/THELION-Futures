import { createContext, useState } from "react"

export const TradingContext = createContext()

export function TradingProvider({ children }) {

  const [positions,setPositions] = useState([])
  const [openOrders,setOpenOrders] = useState([])
  const [orderHistory,setOrderHistory] = useState([])
  const [tradeHistory,setTradeHistory] = useState([])

  function placeOrder(order){
    const newOrder = {
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

    // simulasi order langsung terisi
    setTimeout(()=>{
      setOpenOrders(prev=>prev.filter(o=>o.id!==newOrder.id))
      setPositions(prev=>[
        ...prev,
       {
          ...newOrder,
          entry:newOrder.price
       }
    ])

    setTradeHistory(prev=>[...prev,newOrder])

  },1000)

}
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
        placeOrder,
        fillOrder,
        closePosition
      }}
    >

      {children}

    </TradingContext.Provider>

  )

}
