import { useEffect, useRef } from "react"
import { useTradingStore } from "../store/tradingStore"

export default function ChartOverlay({ chart, series }) {
  const canvasRef = useRef(null)
  const orders = useTradingStore((s) => s.orders)

  // =========================
  // RESIZE + DPI FIX
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement

    const resize = () => {
      const dpr = window.devicePixelRatio || 1

      canvas.width = parent.clientWidth * dpr
      canvas.height = parent.clientHeight * dpr

      canvas.style.width = parent.clientWidth + "px"
      canvas.style.height = parent.clientHeight + "px"

      const ctx = canvas.getContext("2d")
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      if (!o.price) return

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
  // SYNC DENGAN CHART (FIX UTAMA)
  // =========================
  useEffect(() => {
    if (!chart || !series) return

    // redraw saat:
    // 1. chart move
    chart.subscribeCrosshairMove(draw)

    // 2. zoom / scroll
    chart.timeScale().subscribeVisibleTimeRangeChange(draw)

    // 3. initial render
    const interval = setInterval(draw, 500)

    return () => {
      chart.unsubscribeCrosshairMove(draw)
      chart.timeScale().unsubscribeVisibleTimeRangeChange(draw)
      clearInterval(interval)
    }
  }, [chart, series])

  // =========================
  // REDRAW SAAT ORDER UPDATE
  // =========================
  useEffect(() => {
    const timeout = setTimeout(draw, 50)
    return () => clearTimeout(timeout)
  }, [orders])

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
