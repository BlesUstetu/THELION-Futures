import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef()
  const candleSeriesRef = useRef()
  const linesRef = useRef({})
  const dragRef = useRef(null)
  const livePriceRef = useRef(0)

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
      open: 100,
      high: 105,
      low: 95,
      close: 100
    }))

    candleSeries.setData(data)

    // ===============================
    // BINANCE WEBSOCKET
    // ===============================
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const price = parseFloat(data.p)

      livePriceRef.current = price

      candleSeries.update({
        time: Math.floor(Date.now() / 1000),
        open: price,
        high: price,
        low: price,
        close: price
      })
    }

    // ===============================
    // CROSSHAIR (DRAG)
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

      const hit = orders.find(o => Math.abs(o.price - price) < 1)
      if (hit) cancelOrder(hit.id)
    })

    const el = chartRef.current

    // ===============================
    // DRAG SYSTEM
    // ===============================
    el.addEventListener("mousedown", () => {
      const price = dragRef.current?.price
      if (!price) return

      const hitEntry = orders.find(o => Math.abs(o.price - price) < 1)
      const hitTP = tpLines.find(tp => Math.abs(tp.price - price) < 1)
      const hitSL = slLines.find(sl => Math.abs(sl.price - price) < 1)

      if (hitEntry) dragRef.current = { type: "ENTRY", id: hitEntry.id, price }
      else if (hitTP) dragRef.current = { type: "TP", id: hitTP.id, price }
      else if (hitSL) dragRef.current = { type: "SL", id: hitSL.id, price }
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

    return () => {
      ws.close()
      chart.remove()
    }
  }, [])

  // ===============================
  // DRAW LINES + PNL + LIQ
  // ===============================
  useEffect(() => {
    const series = candleSeriesRef.current
    if (!series) return

    const calcPNL = (entry, current, side, amount = 1) => {
      return side === "BUY"
        ? (current - entry) * amount
        : (entry - current) * amount
    }

    const calcLiq = (entry, leverage, side) => {
      return side === "BUY"
        ? entry * (1 - 1 / leverage)
        : entry * (1 + 1 / leverage)
    }

    orders.forEach(order => {
      const key = "entry_" + order.id
      const pnl = calcPNL(order.price, livePriceRef.current, order.side, order.amount)

      if (!linesRef.current[key]) {
        linesRef.current[key] = series.createPriceLine({
          price: order.price,
          lineWidth: 2,
          title: ""
        })
      }

      linesRef.current[key].applyOptions({
        price: order.price,
        color: pnl > 0 ? "#00ff88" : pnl < 0 ? "#ff4444" : "#ffaa00",
        title: `ENTRY ${order.side} | PNL: ${pnl.toFixed(2)}`
      })

      // LIQUIDATION
      const liq = calcLiq(order.price, 10, order.side)
      const liqKey = "liq_" + order.id

      if (!linesRef.current[liqKey]) {
        linesRef.current[liqKey] = series.createPriceLine({
          price: liq,
          color: "#ff8800",
          lineWidth: 1,
          title: "LIQ"
        })
      }

      linesRef.current[liqKey].applyOptions({ price: liq })
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
