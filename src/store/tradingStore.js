import { createContext, useState } from "react"

export const TradingContext = createContext()

export function TradingProvider({ children }) {

  const [positions, setPositions] = useState([])
  const [openOrders, setOpenOrders] = useState([])
  const [orderHistory, setOrderHistory] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])

  // =========================
  // PLACE ORDER
  // =========================
  function placeOrder(order) {

    const newOrder = {
      id: Date.now(),
      ...order,
      status: "OPEN",
      time: new Date().toLocaleTimeString()
    }

    setOpenOrders(prev => [...prev, newOrder])
    setOrderHistory(prev => [...prev, newOrder])
  }

  // =========================
  // FILL ORDER
  // =========================
  function fillOrder(orderId) {

    const order = openOrders.find(o => o.id === orderId)
    if (!order) return

    const filledOrder = {
      ...order,
      status: "FILLED"
    }

    setOpenOrders(prev => prev.filter(o => o.id !== orderId))
    setPositions(prev => [...prev, filledOrder])
    setTradeHistory(prev => [...prev, filledOrder])

  }

  // =========================
  // CLOSE POSITION
  // =========================
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
