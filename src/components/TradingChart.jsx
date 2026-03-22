import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"

export default function TradingChart() {
  const chartContainerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef()
  const orderLinesRef = useRef([])
  const liveLineRef = useRef()

  const { orders } = useTradingStore()

  // =========================
  // INIT CHART (ONLY ONCE)
  // =========================
  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
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

    // =========================
    // SAMPLE DATA (AMAN)
    // =========================
    series.setData([
      { time: 1700000000, open: 68000, high: 69000, low: 67000, close: 68500 },
      { time: 1700000600, open: 68500, high: 68800, low: 68000, close: 68200 },
    ])

    // =========================
    // CLICK → SET PRICE
    // =========================
    chart.subscribeClick((param) => {
      if (!param.point) return

      const price = series.coordinateToPrice(param.point.y)
      useTradingStore.getState().setPrice(price)
    })

    // =========================
    // LIVE PRICE LINE
    // =========================
    const liveLine = series.createPriceLine({
      price: 0,
      color: "yellow",
      lineWidth: 1,
      axisLabelVisible: true,
      title: "LIVE",
    })

    liveLineRef.current = liveLine

    // =========================
    // BINANCE WS
    // =========================
    const ws = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    )

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      const price = parseFloat(data.p)

      liveLine.applyOptions({ price })
    }

    return () => {
      chart.remove()
    }
  }, [])

  // =========================
  // ORDER LINES (SYNC)
  // =========================
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    // hapus lama
    orderLinesRef.current.forEach((line) => {
      try {
        series.removePriceLine(line)
      } catch {}
    })

    orderLinesRef.current = []

    // render baru
    orders.forEach((order) => {
      const line = series.createPriceLine({
        price: order.price,
        color: order.side === "BUY" ? "green" : "red",
        lineWidth: 2,
        axisLabelVisible: true,
        title: order.side,
      })

      orderLinesRef.current.push(line)
    })
  }, [orders])

  // =========================
  // DOUBLE TAP → DELETE
  // =========================
  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current

    if (!chart || !series) return

    chart.subscribeClick((param) => {
      if (param.tapCount !== 2) return
      if (!param.point) return

      const price = series.coordinateToPrice(param.point.y)

      const { orders, removeOrder } = useTradingStore.getState()

      const found = orders.find(
        (o) => Math.abs(o.price - price) < 50
      )

      if (found) {
        removeOrder(found.id)
      }
    })
  }, [])

  return <div ref={chartContainerRef} className="w-full h-full" />
}
