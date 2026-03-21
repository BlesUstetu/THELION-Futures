import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef()
  const candleSeriesRef = useRef()
  const linesRef = useRef({})
  const dragRef = useRef(null)

  const {
    orders,
    tpLines,
    slLines,
    cancelOrder,
    updateTP,
    updateSL,
    updateEntry
  } = useTrading()

  let currentPrice = 100

  // ===============================
  // INIT CHART
  // ===============================
  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 500,
      layout: { background: { color: "#0b0f14" }, textColor: "#ccc" },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" }
      }
    })

    const candleSeries = chart.addCandlestickSeries()
    candleSeriesRef.current = candleSeries

    const data = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      open: 100 + Math.random() * 10,
      high: 110 + Math.random() * 10,
      low: 90 + Math.random() * 10,
      close: 100 + Math.random() * 10
    }))

    candleSeries.setData(data)

    // ===============================
    // CROSSHAIR (UNTUK DRAG)
    // ===============================
    chart.subscribeCrosshairMove(param => {
      if (!param || !param.seriesPrices) return
      const price = param.seriesPrices.get(candleSeries)
      if (!price) return

      dragRef.current = { ...dragRef.current, price }
    })

    // ===============================
    // CLICK CANCEL
    // ===============================
    chart.subscribeClick(param => {
      if (!param || !param.seriesPrices) return

      const price = param.seriesPrices.get(candleSeries)

      const hit = orders.find(o => Math.abs(o.price - price) < 0.5)
      if (hit) cancelOrder(hit.id)
    })

    // ===============================
    // MOUSE EVENTS (DRAG)
    // ===============================
    const el = chartRef.current

    el.addEventListener("mousedown", () => {
      if (!dragRef.current) return

      const price = dragRef.current.price

      const hitEntry = orders.find(o => Math.abs(o.price - price) < 0.5)
      const hitTP = tpLines.find(tp => Math.abs(tp.price - price) < 0.5)
      const hitSL = slLines.find(sl => Math.abs(sl.price - price) < 0.5)

      if (hitEntry) dragRef.current = { type: "ENTRY", id: hitEntry.id }
      else if (hitTP) dragRef.current = { type: "TP", id: hitTP.id }
      else if (hitSL) dragRef.current = { type: "SL", id: hitSL.id }
      else dragRef.current = null
    })

    el.addEventListener("mousemove", () => {
      if (!dragRef.current?.type) return

      const price = dragRef.current.price

      if (dragRef.current.type === "ENTRY") updateEntry(dragRef.current.id, price)
      if (dragRef.current.type === "TP") updateTP(dragRef.current.id, price)
      if (dragRef.current.type === "SL") updateSL(dragRef.current.id, price)
    })

    el.addEventListener("mouseup", () => {
      dragRef.current = null
    })

    return () => chart.remove()
  }, [])

  // ===============================
  // DRAW LINES + PNL
  // ===============================
  useEffect(() => {
    const series = candleSeriesRef.current
    if (!series) return

    Object.values(linesRef.current).forEach(line => {
      series.removePriceLine(line)
    })
    linesRef.current = {}

    const calcPNL = (entry, current, side, amount = 1) => {
      return side === "BUY"
        ? (current - entry) * amount
        : (entry - current) * amount
    }

    orders.forEach(order => {
      const pnl = calcPNL(order.price, currentPrice, order.side)

      const line = series.createPriceLine({
        price: order.price,
        color: pnl >= 0 ? "#00ff88" : "#ff4444",
        lineWidth: 2,
        title: `ENTRY ${order.side} | PNL: ${pnl.toFixed(2)}`
      })

      linesRef.current["entry_" + order.id] = line
    })

    tpLines.forEach(tp => {
      const line = series.createPriceLine({
        price: tp.price,
        color: "#00ff88",
        lineStyle: 2,
        title: "TP"
      })

      linesRef.current["tp_" + tp.id] = line
    })

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
