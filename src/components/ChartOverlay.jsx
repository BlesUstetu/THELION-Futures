import { useEffect, useRef } from "react"
import { useTradingStore } from "../store/tradingStore"

export default function ChartOverlay({ chart, series }) {
  const canvasRef = useRef(null)
  const orders = useTradingStore((s) => s.orders)

  // =========================
  // DPI + RESIZE FIX
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1

      canvas.width = parent.clientWidth * dpr
      canvas.height = parent.clientHeight * dpr

      canvas.style.width = parent.clientWidth + "px"
      canvas.style.height = parent.clientHeight + "px"

      const ctx = canvas.getContext("2d")
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      draw()
    }

    resize()
    window.addEventListener("resize", resize)

    return () => window.removeEventListener("resize", resize)
  }, [])

  // =========================
  // DRAW FUNCTION
  // =========================
  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !series) return

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    orders.forEach((o) => {
      if (!o.price || isNaN(o.price)) return

      const y = series.priceToCoordinate(o.price)
      if (y === null || y === undefined) return

      ctx.strokeStyle = o.side === "BUY" ? "#22c55e" : "#ef4444"
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    })
  }

  // =========================
  // CHART SYNC
  // =========================
  useEffect(() => {
    if (!chart || !series) return

    chart.subscribeCrosshairMove(draw)
    chart.timeScale().subscribeVisibleTimeRangeChange(draw)

    return () => {
      chart.unsubscribeCrosshairMove(draw)
      chart.timeScale().unsubscribeVisibleTimeRangeChange(draw)
    }
  }, [chart, series])

  // =========================
  // ORDER UPDATE
  // =========================
  useEffect(() => {
    draw()
  }, [orders])

  // =========================
  // GLOBAL REDRAW (LIVE PRICE)
  // =========================
  useEffect(() => {
    const handler = () => draw()

    window.addEventListener("chart-redraw", handler)
    return () => window.removeEventListener("chart-redraw", handler)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10,
        pointerEvents: "none",
      }}
    />
  )
}
