import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef()
  const candleSeriesRef = useRef()
  const linesRef = useRef({})

  const {
    orders,
    tpLines,
    slLines,
    cancelOrder,
    updateTP,
    updateSL
  } = useTrading()

  // ===============================
  // INIT CHART
  // ===============================
  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0b0f14" },
        textColor: "#ccc"
      },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" }
      }
    })

    const candleSeries = chart.addCandlestickSeries()
    candleSeriesRef.current = candleSeries

    // dummy data
    const data = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      open: 100 + Math.random() * 10,
      high: 110 + Math.random() * 10,
      low: 90 + Math.random() * 10,
      close: 100 + Math.random() * 10
    }))

    candleSeries.setData(data)

    return () => chart.remove()
  }, [])

  // ===============================
  // DRAW ORDER LINES
  // ===============================
  useEffect(() => {
    const series = candleSeriesRef.current
    if (!series) return

    // CLEAR OLD
    Object.values(linesRef.current).forEach(line => {
      series.removePriceLine(line)
    })
    linesRef.current = {}

    // ENTRY
    orders.forEach(order => {
      const line = series.createPriceLine({
        price: order.price,
        color: order.side === "BUY" ? "#00ff88" : "#ff4444",
        lineWidth: 2,
        title: `ENTRY ${order.side}`
      })

      linesRef.current["entry_" + order.id] = line
    })

    // TP
    tpLines.forEach(tp => {
      const line = series.createPriceLine({
        price: tp.price,
        color: "#00ff88",
        lineStyle: 2,
        title: "TP"
      })

      linesRef.current["tp_" + tp.id] = line
    })

    // SL
    slLines.forEach(sl => {
      const line = series.createPriceLine({
        price: sl.price,
        color: "#ff0000",
        lineStyle: 2,
        title: "SL"
      })

      linesRef.current["sl_" + sl.id] = line
    })

  }, [orders, tpLines, slLines])

  return <div ref={chartRef} style={{ width: "100%" }} />
}
