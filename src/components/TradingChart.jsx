import { useEffect, useRef, useState } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"
import ChartOverlay from "./ChartOverlay"

export default function TradingChart() {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const wsRef = useRef(null)

  const [chartReady, setChartReady] = useState(false)

  // =========================
  // INIT CHART (ONLY ONCE)
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

      rightPriceScale: {
        autoScale: true,
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const series = chart.addCandlestickSeries()

    chartRef.current = chart
    seriesRef.current = series

    // =========================
    // SAMPLE DATA (SAFE)
    // =========================
    series.setData([
      {
        time: 1700000000,
        open: 68000,
        high: 69000,
        low: 67000,
        close: 68500,
      },
      {
        time: 1700000600,
        open: 68500,
        high: 68800,
        low: 68000,
        close: 68200,
      },
    ])

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

    // =========================
    // BINANCE WEBSOCKET
    // =========================
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

      // =========================
      // UPDATE PNL + LIQ
      // =========================
      orders.forEach((o) => {
        if (!o.price) return

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

    // =========================
    // RESIZE FIX
    // =========================
    const handleResize = () => {
      chart.applyOptions({
        width: containerRef.current.clientWidth,
      })
    }

    window.addEventListener("resize", handleResize)

    // =========================
    // READY FLAG
    // =========================
    setChartReady(true)

    // =========================
    // CLEANUP
    // =========================
    return () => {
      window.removeEventListener("resize", handleResize)
      ws.close()
      chart.remove()
    }
  }, [])

  // =========================
  // CLICK CHART → SET PRICE
  // =========================
  useEffect(() => {
    const chart = chartRef.current
    const series = seriesRef.current

    if (!chart || !series) return

    chart.subscribeClick((param) => {
      if (!param.point) return

      const price = series.coordinateToPrice(param.point.y)
      if (!price) return

      useTradingStore.getState().setPrice(price)
    })
  }, [])

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* CHART */}
      <div ref={containerRef} className="w-full h-full" />

      {/* OVERLAY (NO UI CHANGE) */}
      {chartReady && (
        <ChartOverlay
          chart={chartRef.current}
          series={seriesRef.current}
        />
      )}
    </div>
  )
}
