import React, { createContext, useContext, useState, useEffect } from "react"

const TradingContext = createContext()

export const TradingProvider = ({ children }) => {

  // ===============================
  // STATE
  // ===============================
  const [pair, setPair] = useState("BINANCE:BTCUSDT")

  const [orders, setOrders] = useState([])
  const [tpLines, setTpLines] = useState([])
  const [slLines, setSlLines] = useState([])
  const [liquidationLines, setLiquidationLines] = useState([])

  const [livePrice, setLivePrice] = useState(null)

  // ===============================
  // PLACE ORDER
  // ===============================
  const placeOrder = ({ price, side }) => {
    const id = Date.now()

    const tpPercent = 0.02
    const slPercent = 0.01
    const liqPercent = 0.1

    let tp, sl, liq

    if (side === "BUY") {
      tp = price * (1 + tpPercent)
      sl = price * (1 - slPercent)
      liq = price * (1 - liqPercent)
    } else {
      tp = price * (1 - tpPercent)
      sl = price * (1 + slPercent)
      liq = price * (1 + liqPercent)
    }

    const order = { id, price, side }

    setOrders(prev => [...prev, order])
    setTpLines(prev => [...prev, { id, price: tp }])
    setSlLines(prev => [...prev, { id, price: sl }])
    setLiquidationLines(prev => [...prev, { id, price: liq }])
  }

  // ===============================
  // CANCEL ORDER
  // ===============================
  const cancelOrder = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id))
    setTpLines(prev => prev.filter(tp => tp.id !== id))
    setSlLines(prev => prev.filter(sl => sl.id !== id))
    setLiquidationLines(prev => prev.filter(liq => liq.id !== id))
  }

  // ===============================
  // UPDATE TP / SL (DRAG)
  // ===============================
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

  // ===============================
  // LIVE PRICE (WEBSOCKET)
  // ===============================
  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLivePrice(parseFloat(data.p))
    }

    ws.onerror = (err) => {
      console.error("WS Error:", err)
    }

    return () => ws.close()
  }, [])

  // ===============================
  // CHANGE PAIR
  // ===============================
  const changePair = (newPair) => {
    setPair(newPair)
  }

  // ===============================
  // EXPORT CONTEXT
  // ===============================
  return (
    <TradingContext.Provider
      value={{
        pair,
        setPair: changePair,

        orders,
        tpLines,
        slLines,
        liquidationLines,

        livePrice,

        placeOrder,
        cancelOrder,

        updateTP,
        updateSL,
      }}
    >
      {children}
    </TradingContext.Provider>
  )
}

// ===============================
// HOOK (WAJIB ADA)
// ===============================
export const useTrading = () => useContext(TradingContext)
