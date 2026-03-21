import React, { createContext, useContext, useState } from "react"

const TradingContext = createContext()

export const TradingProvider = ({ children }) => {
  const [pair, setPair] = useState("BINANCE:BTCUSDT")

  const [orders, setOrders] = useState([])
  const [tpLines, setTpLines] = useState([])
  const [slLines, setSlLines] = useState([])
  const [livePrice, setLivePrice] = useState(null)

  // ===============================
  // ORDER
  // ===============================
  const placeOrder = ({ side, price, amount, leverage }) => {
    const id = Date.now()

    const order = {
      id,
      side,
      price,
      amount,
      leverage
    }

    setOrders(prev => [...prev, order])

    // auto TP SL (dummy logic)
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

  return (
    <TradingContext.Provider value={{
      pair,
      setPair,
      orders,
      tpLines,
      slLines,
      livePrice,
      setLivePrice,
      placeOrder,
      cancelOrder,
      updateTP,
      updateSL
    }}>
      {children}
    </TradingContext.Provider>
  )
}

export const useTrading = () => useContext(TradingContext)
