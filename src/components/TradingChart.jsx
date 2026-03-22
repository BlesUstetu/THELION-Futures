import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"

export default function TradingChart() {
  const containerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef()

  const orderLinesRef = useRef([])
  const liveLineRef = useRef()
  const rrSeriesRef = useRef()
  const wsRef = useRef()

  const dragRef = useRef({
    active: false,
    type: null,
    orderId: null,
  })

  const currentPriceRef = useRef(0)
  const { orders } = useTradingStore()

  // =========================
  // INIT CHART
  // =========================
  useEffect(() => {
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#ccc",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
    })

    const series = chart.addCandlestickSeries()
    const rrSeries = chart.addAreaSeries({
      lineColor: "transparent",
      topColor: "rgba(34,197,94,0.2)",
      bottomColor: "rgba(239,68,68,0.2)",
    })

    chartRef.current = chart
    seriesRef.current = series
    rrSeriesRef.current = rrSeries

    series.setData([
      { time: 1700000000, open: 68000, high: 69000, low: 67000, close: 68500 },
      { time: 1700000600, open: 68500, high: 68800, low: 68000, close: 68200 },
    ])

    // CLICK (SELECT / SET PRICE / DELETE)
    chart.subscribeClick((param) => {
      if (!param.point) return

      const price = series.coordinateToPrice(param.point.y)
      const store = useTradingStore.getState()
      const { orders, removeOrder } = store

      // DOUBLE TAP DELETE
      if (param.tapCount === 2) {
        const found = orders.find(o => Math.abs(o.price - price) < 50)
        if (found) removeOrder(found.id)
        return
      }

      // SELECT LINE
      for (let o of orders) {
        if (Math.abs(o.price - price) < 50) {
          dragRef.current = { active: true, type: "entry", orderId: o.id }
          return
        }
        if (Math.abs(o.tp - price) < 50) {
          dragRef.current = { active: true, type: "tp", orderId: o.id }
          return
        }
        if (Math.abs(o.sl - price) < 50) {
          dragRef.current = { active: true, type: "sl", orderId: o.id }
          return
        }
      }

      // SET PRICE
      store.setPrice(price)
      dragRef.current.active = false
    })

    // DRAG
    chart.subscribeCrosshairMove((param) => {
      if (!dragRef.current.active || !param.point) return

      const price = series.coordinateToPrice(param.point.y)
      const store = useTradingStore.getState()
      const { orderId, type } = dragRef.current

      if (type === "entry") {
        store.updateOrder(orderId, { price })
        store.setPrice(price)
      }
      if (type === "tp") store.setTP(orderId, price)
      if (type === "sl") store.setSL(orderId, price)
    })

    // LIVE PRICE
    const liveLine = series.createPriceLine({
      price: 0,
      color: "yellow",
      lineWidth: 1,
      title: "LIVE",
    })

    liveLineRef.current = liveLine

    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade")
    wsRef.current = ws

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const price = parseFloat(data.p)

      currentPriceRef.current = price
      liveLine.applyOptions({ price })

      const store = useTradingStore.getState()
      const { orders, leverage } = store

      orders.forEach((o) => {
        let pnl =
          o.side === "BUY"
            ? (price - o.price) * o.amount
            : (o.price - price) * o.amount

        store.updatePNL(o.id, pnl)

        let liq =
          o.side === "BUY"
            ? o.price - o.price / leverage
            : o.price + o.price / leverage

        store.updateLiquidation(o.id, liq)
      })
    }

    return () => {
      ws.close()
      chart.remove()
    }
  }, [])

  // =========================
  // RENDER ORDER + RR
  // =========================
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    orderLinesRef.current.forEach((l) => {
      try {
        series.removePriceLine(l.entry)
        series.removePriceLine(l.tp)
        series.removePriceLine(l.sl)
        series.removePriceLine(l.liq)
      } catch {}
    })

    orderLinesRef.current = []

    orders.forEach((o) => {
      const entry = series.createPriceLine({
        price: o.price,
        color: o.side === "BUY" ? "#22c55e" : "#ef4444",
        lineWidth: 2,
        title: "ENTRY",
      })

      const tp = series.createPriceLine({
        price: o.tp,
        color: "#22c55e",
        lineStyle: 2,
        title: "TP",
      })

      const sl = series.createPriceLine({
        price: o.sl,
        color: "#ef4444",
        lineStyle: 2,
        title: "SL",
      })

      const liq = series.createPriceLine({
        price: o.liquidation || 0,
        color: "#facc15",
        lineStyle: 3,
        title: "LIQ",
      })

      orderLinesRef.current.push({ entry, tp, sl, liq })

      // RR BOX (simple visual)
      if (rrSeriesRef.current && o.tp && o.sl) {
        rrSeriesRef.current.setData([
          { time: 1700000000, value: o.price },
          { time: 1700000600, value: o.tp },
        ])
      }
    })
  }, [orders])

  return <div ref={containerRef} className="w-full h-full" />
}
