import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"

export default function TradingChart() {
  const containerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef()

  const orderLinesRef = useRef([])
  const liveLineRef = useRef()

  const dragRef = useRef({
    active: false,
    type: null,
    orderId: null,
  })

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

    chartRef.current = chart
    seriesRef.current = series

    series.setData([
      { time: 1700000000, open: 68000, high: 69000, low: 67000, close: 68500 },
      { time: 1700000600, open: 68500, high: 68800, low: 68000, close: 68200 },
    ])

    // CLICK → SET PRICE / SELECT LINE
    chart.subscribeClick((param) => {
      if (!param.point) return

      const price = series.coordinateToPrice(param.point.y)
      const { orders } = useTradingStore.getState()

      let found = false

      for (let o of orders) {
        if (Math.abs(o.price - price) < 50) {
          dragRef.current = { active: true, type: "entry", orderId: o.id }
          found = true
          return
        }

        if (Math.abs(o.tp - price) < 50) {
          dragRef.current = { active: true, type: "tp", orderId: o.id }
          found = true
          return
        }

        if (Math.abs(o.sl - price) < 50) {
          dragRef.current = { active: true, type: "sl", orderId: o.id }
          found = true
          return
        }
      }

      if (!found) {
        useTradingStore.getState().setPrice(price)
      }
    })

    // DRAG
    chart.subscribeCrosshairMove((param) => {
      if (!dragRef.current.active) return
      if (!param.point) return

      const price = series.coordinateToPrice(param.point.y)
      const store = useTradingStore.getState()

      const { orderId, type } = dragRef.current

      if (type === "entry") {
        store.updateOrder(orderId, { price })
        store.setPrice(price)
      }

      if (type === "tp") {
        store.setTP(orderId, price)
      }

      if (type === "sl") {
        store.setSL(orderId, price)
      }
    })

    // RELEASE + DOUBLE TAP DELETE
    chart.subscribeClick((param) => {
      if (param.tapCount === 2 && param.point) {
        const price = series.coordinateToPrice(param.point.y)
        const { orders, removeOrder } = useTradingStore.getState()

        const found = orders.find(
          (o) => Math.abs(o.price - price) < 50
        )

        if (found) removeOrder(found.id)
      }

      dragRef.current.active = false
    })

    // LIVE PRICE
    const liveLine = series.createPriceLine({
      price: 0,
      color: "yellow",
      lineWidth: 1,
      axisLabelVisible: true,
      title: "LIVE",
    })

    liveLineRef.current = liveLine

    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    )

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const price = parseFloat(data.p)

      liveLine.applyOptions({ price })
    }

    return () => chart.remove()
  }, [])

  // =========================
  // RENDER ORDER LINES
  // =========================
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    orderLinesRef.current.forEach((l) => {
      try {
        series.removePriceLine(l.entry)
        series.removePriceLine(l.tp)
        series.removePriceLine(l.sl)
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

      orderLinesRef.current.push({ id: o.id, entry, tp, sl })
    })
  }, [orders])

  return <div ref={containerRef} className="w-full h-full" />
}
