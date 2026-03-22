import { useEffect, useRef } from "react"
import { useTradingStore } from "../store/tradingStore"

export default function ChartOverlay({ chart, series }) {
  const canvasRef = useRef(null)
  const orders = useTradingStore((s) => s.orders)

  // =========================
  // RESIZE
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement

    const resize = () => {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
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
    const ctx = canvas.getContext("2d")

    if (!series) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    orders.forEach((o) => {
      if (!o.price) return

      const entryY = series.priceToCoordinate(o.price)

      // 🔥 FORCE fallback kalau null
      const y = entryY ?? canvas.height / 2

      ctx.strokeStyle = o.side === "BUY" ? "#22c55e" : "#ef4444"
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    })
  }

  // =========================
  // 🔥 CORE FIX: SYNC DENGAN CHART
  // =========================
  useEffect(() => {
    if (!chart || !series) return

    // redraw saat chart gerak
    chart.subscribeCrosshairMove(() => {
      draw()
    })

    // redraw awal
    setTimeout(draw, 300)

  }, [chart, series, orders])

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
