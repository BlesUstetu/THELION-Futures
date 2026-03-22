import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"

export default function TradingChart() {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  const orderLinesRef = useRef([])
  const wsRef = useRef(null)

  const dragRef = useRef({
    active: false,
    type: null,
    orderId: null,
  })

  // ✅ PENTING: subscribe dengan selector
  const orders = useTradingStore((state) => state.orders)

  // =========================
  // INIT CHART (ONCE)
  // =========================
  useEffect(() => {
    if (!containerRef.current) return

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

    // dummy data
    series.setData([
      { time: 1700000000, open: 68000, high: 69000, low: 67000, close: 68500 },
      { time: 1700000600, open: 68500, high: 68800, low: 68000, close: 68200 },
    ])

    // =========================
    // LIVE PRICE
    // =========================
    const liveLine = series.createPriceLine({
      price: 0,
      color: "yellow",
      lineWidth: 1,
      axisLabelVisible: true,
      title: "LIVE",
    })

    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    )
    wsRef.current = ws

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const price = Number(data.p)

      liveLine.applyOptions({ price })

      const store = useTradingStore.getState()
      const { orders, leverage } = store

      orders.forEach((o) => {
        const pnl =
          o.side === "BUY"
            ? (price - o.price) * o.amount
            : (o.price - price) * o.amount

        const liq =
          o.side === "BUY"
            ? o.price - o.price / leverage
            : o.price + o.price / leverage

        store.updatePNL(o.id, pnl)
        store.updateLiquidation(o.id, liq)
      })
    }

    return () => {
      ws.close()
      chart.remove()
    }
  }, [])

  // =========================
  // 🔥 CORE FIX: RENDER ORDER LINE
  // =========================
  useEffect(() => {
    const series = seriesRef.current

    // ✅ guard
    if (!series) return

    console.log("🔥 SYNC ORDERS:", orders)

    // =========================
    // CLEAR OLD
    // =========================
    orderLinesRef.current.forEach((l) => {
      try {
        series.removePriceLine(l.entry)
        series.removePriceLine(l.tp)
        series.removePriceLine(l.sl)
        series.removePriceLine(l.liq)
      } catch {}
    })

    orderLinesRef.current = []

    // =========================
    // DRAW NEW (ANTI BUG)
    // =========================
    orders.forEach((o) => {
      // 🔥 VALIDATION SUPER PENTING
      if (!o || o.price == null) return

      const price = Number(o.price)
      const tp = Number(o.tp || 0)
      const sl = Number(o.sl || 0)
      const liq = Number(o.liquidation || 0)

      // ENTRY
      const entryLine = series.createPriceLine({
        price,
        color: o.side === "BUY" ? "#22c55e" : "#ef4444",
        lineWidth: 2,
        axisLabelVisible: true,
        title: `ENTRY ${price}`,
      })

      // TP
      const tpLine = series.createPriceLine({
        price: tp,
        color: "#22c55e",
        lineStyle: 2,
        axisLabelVisible: true,
        title: "TP",
      })

      // SL
      const slLine = series.createPriceLine({
        price: sl,
        color: "#ef4444",
        lineStyle: 2,
        axisLabelVisible: true,
        title: "SL",
      })

      // LIQ
      const liqLine = series.createPriceLine({
        price: liq,
        color: "#facc15",
        lineStyle: 3,
        axisLabelVisible: true,
        title: "LIQ",
      })

      orderLinesRef.current.push({
        entry: entryLine,
        tp: tpLine,
        sl: slLine,
        liq: liqLine,
      })
    })
  }, [orders])

  return <div ref={containerRef} className="w-full h-full" />
}
