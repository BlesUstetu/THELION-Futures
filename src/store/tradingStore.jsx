import React, { createContext, useContext, useState } from "react"

const TradingContext = createContext()

export const TradingProvider = ({ children }) => {
  const [pair, setPair] = useState("BTCUSDT")

  const [orders, setOrders] = useState([])
  const [tpLines, setTpLines] = useState([])
  const [slLines, setSlLines] = useState([])

  // ===============================
  // PLACE ORDER
  // ===============================
  const placeOrder = ({ side, price, amount }) => {
    const id = Date.now()

    const order = { id, side, price, amount }

    setOrders(prev => [...prev, order])

    // auto TP SL
    const tp = {
      id,
      price: side === "BUY" ? price * 1.02 : price * 0.98
    }

    const sl = {
      id,
      price: side === "BUY" ? price * 0.98 : price * 1.02
    }

    setTpLines(prev => [...prev, tp])
    setSlLines(prev => [...prev, sl])
  }

  const cancelOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id))
    setTpLines(prev => prev.filter(o => o.id !== id))
    setSlLines(prev => prev.filter(o => o.id !== id))
  }

  const updateTP = (id, price) => {
    setTpLines(prev =>
      prev.map(tp => tp.id === id ? { ...tp, price } : tp)
    )
  }

  const updateSL = (id, price) => {
    setSlLines(prev =>
      prev.map(sl => sl.id === id ? { ...sl, price } : sl)
    )
  }

  const updateEntry = (id, price) => {
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, price } : o)
    )
  }

  return (
    <TradingContext.Provider value={{
      pair,
      orders,
      tpLines,
      slLines,
      placeOrder,
      cancelOrder,
      updateTP,
      updateSL,
      updateEntry
    }}>
      {children}
    </TradingContext.Provider>
  )
}

export const useTrading = () => useContext(TradingContext)
