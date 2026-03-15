import { createContext, useState } from "react"
export const TradingContext = createContext()
export function TradingProvider({ children }) {
  const [positions, setPositions] = useState([])
  const [openOrders, setOpenOrders] = useState([])
  const [orderHistory, setOrderHistory] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])

  // membuat order baru
  function placeOrder(order) {
    const newOrder = {
      ...order,
      status: "OPEN"
    }
    setOpenOrders(prev => [...prev, newOrder])
    setOrderHistory(prev => [...prev, newOrder])
  }

  // simulasi order terisi
  function fillOrder(orderId) {

    const order = openOrders.find(o => o.id === orderId)

    if (!order) return

    const filledOrder = {
      ...order,
      status: "FILLED"
    }

    // hapus dari open orders
    setOpenOrders(prev => prev.filter(o => o.id !== orderId))

    // tambahkan ke positions
    setPositions(prev => [...prev, filledOrder])

    // tambahkan ke trade history
    setTradeHistory(prev => [...prev, filledOrder])

  }

  // menutup posisi
  function closePosition(positionId) {

    const position = positions.find(p => p.id === positionId)

    if (!position) return

    setPositions(prev => prev.filter(p => p.id !== positionId))

    const closedTrade = {
      ...position,
      status: "CLOSED",
      closeTime: new Date().toLocaleTimeString()
    }

    setTradeHistory(prev => [...prev, closedTrade])

  }

  return (

    <TradingContext.Provider value={{

      positions,
      openOrders,
      orderHistory,
      tradeHistory,

      placeOrder,
      fillOrder,
      closePosition

    }}>

      {children}

    </TradingContext.Provider>

  )

}
