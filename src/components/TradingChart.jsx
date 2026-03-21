import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef()
  const candleSeriesRef = useRef()
  const linesRef = useRef({})
  const dragRef = useRef(null)
  const livePriceRef = useRef(100)

  const {
    orders,
    tpLines,
    slLines,
    cancelOrder,
    updateTP,
    updateSL,
    updateEntry
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

    const now = Math.floor(Date.now() / 1000)

    const data = Array.from({ length: 100 }, (_, i) => ({
      time: now - (100 - i) * 60,
      open: 100 + Math.random() * 10,
      high: 110 + Math.random() * 10,
      low: 90 + Math.random() * 10,
      close: 100 + Math.random() * 10
    }))

    candleSeries.setData(data)

    // LIVE PRICE SIMULATION
    setInterval(() => {
      livePriceRef.current += (Math.random() - 0.5) * 0.5
    }, 500)

    // UPDATE CANDLE (REALTIME FEEL)
    const live = setInterval(() => {
      candleSeries.update({
        time: Math.floor(Date.now() / 1000),
        open: livePriceRef.current,
        high: livePriceRef.current,
        low: livePriceRef.current,
        close: livePriceRef.current
      })
    }, 1000)

    // CROSSHAIR (DRAG)
    chart.subscribeCrosshairMove(param => {
      if (!param || !param.seriesPrices) return
      const price = param.seriesPrices.get(candleSeries)
      if (!price) return
      dragRef.current = { ...dragRef.current, price }
    })

    // CLICK CANCEL
    chart.subscribeClick(param => {
      if (!param || !param.seriesPrices) return
      const price = param.seriesPrices.get(candleSeries)

      const hit = orders.find(o => Math.abs(o.price - price) < 0.5)
      if (hit) cancelOrder(hit.id)
    })

    const el = chartRef.current

    // MOUSEDOWN
    el.addEventListener("mousedown", () => {
      const price = dragRef.current?.price
      if (!price) return

      const hitEntry = orders.find(o => Math.abs(o.price - price) < 0.5)
      const hitTP = tpLines.find(tp => Math.abs(tp.price - price) < 0.5)
      const hitSL = slLines.find(sl => Math.abs(sl.price - price) < 0.5)

      if (hitEntry) dragRef.current = { type: "ENTRY", id: hitEntry.id, price }
      else if (hitTP) dragRef.current = { type: "TP", id: hitTP.id, price }
      else if (hitSL) dragRef.current = { type: "SL", id: hitSL.id, price }
      else dragRef.current = null
    })

    // MOUSEMOVE
    el.addEventListener("mousemove", () => {
      if (!dragRef.current?.type) return
      const price = dragRef.current.price

      if (dragRef.current.type === "ENTRY") updateEntry(dragRef.current.id, price)
      if (dragRef.current.type === "TP") updateTP(dragRef.current.id, price)
      if (dragRef.current.type === "SL") updateSL(dragRef.current.id, price)
    })

    // MOUSEUP
    el.addEventListener("mouseup", () => {
      dragRef.current = null
    })

    return () => {
      clearInterval(live)
      chart.remove()
    }
  }, [])

  // ===============================
  // DRAW LINES (NO FLICKER)
  // ===============================
  useEffect(() => {
    const series = candleSeriesRef.current
    if (!series) return

    const calcPNL = (entry, current, side, amount = 1) => {
      return side === "BUY"
        ? (current - entry) * amount
        : (entry - current) * amount
    }

    orders.forEach(order => {
      const key = "entry_" + order.id
      const pnl = calcPNL(order.price, livePriceRef.current, order.side)

      if (!linesRef.current[key]) {
        linesRef.current[key] = series.createPriceLine({
          price: order.price,
          color: "#ffaa00",
          lineWidth: 2,
          title: ""
        })
      }

      linesRef.current[key].applyOptions({
        price: order.price,
        color: pnl >= 0 ? "#00ff88" : "#ff4444",
        title: `ENTRY ${order.side} | PNL: ${pnl.toFixed(2)}`
      })
    })

    tpLines.forEach(tp => {
      const key = "tp_" + tp.id

      if (!linesRef.current[key]) {
        linesRef.current[key] = series.createPriceLine({
          price: tp.price,
          color: "#00ff88",
          lineStyle: 2,
          title: "TP"
        })
      }

      linesRef.current[key].applyOptions({ price: tp.price })
    })

    slLines.forEach(sl => {
      const key = "sl_" + sl.id

      if (!linesRef.current[key]) {
        linesRef.current[key] = series.createPriceLine({
          price: sl.price,
          color: "#ff0000",
          lineStyle: 2,
          title: "SL"
        })
      }

      linesRef.current[key].applyOptions({ price: sl.price })
    })

  }, [orders, tpLines, slLines])

  return <div ref={chartRef} style={{ width: "100%" }} />
}
