import React, { useEffect, useRef, useState } from "react"
import { createChart } from "lightweight-charts"
import { connectBinanceWS } from "../services/binanceWS"
import { useTradingStore } from "../store/tradingStore"

const TradingChart = () => {
  const ref = useRef()
  const chartRef = useRef()
  const candleRef = useRef()
  const linesRef = useRef({})

  const [drag, setDrag] = useState(null)

  const { orders, updateOrder } = useTradingStore()

  // INIT
  useEffect(() => {
    if (chartRef.current) return

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 500,
      layout: { background: { color: "#000" }, textColor: "#fff" },
    })

    const candle = chart.addCandlestickSeries()

    chartRef.current = chart
    candleRef.current = candle

    candle.setData([
      { time: "2024-01-01", open: 100, high: 110, low: 90, close: 105 },
    ])

    chart.subscribeCrosshairMove((param) => {
      if (!drag) return
      const price = param.seriesPrices.get(candle)
      if (!price) return

      updateOrder(drag.id, { [drag.type]: price })
    })

    window.addEventListener("mouseup", () => setDrag(null))

    return () => chart.remove()
  }, [])

  // DRAW LINES
  useEffect(() => {
    if (!candleRef.current) return

    Object.values(linesRef.current).forEach((l) =>
      candleRef.current.removePriceLine(l)
    )
    linesRef.current = {}

    orders.forEach((o) => {
      const entry = candleRef.current.createPriceLine({
        price: o.price,
        color: "#ffaa00",
        title: "ENTRY",
      })

      const tp = candleRef.current.createPriceLine({
        price: o.tp,
        color: "#00ff88",
        title: "TP",
      })

      const sl = candleRef.current.createPriceLine({
        price: o.sl,
        color: "#ff4444",
        title: "SL",
      })

      const liq = candleRef.current.createPriceLine({
        price: o.liquidation || o.price * 0.9,
        color: "#ff00ff",
        title: "LIQ",
      })

      attach(entry, o.id, "price")
      attach(tp, o.id, "tp")
      attach(sl, o.id, "sl")

      linesRef.current[o.id] = entry
    })
  }, [orders])

  const attach = (line, id, type) => {
    ref.current.addEventListener("mousedown", () => {
      setDrag({ id, type })
    })
  }

  return <div ref={ref} style={{ height: 500 }} />
}

export default TradingChart
