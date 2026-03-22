import { useEffect, useRef } from "react"
import { useTradingStore } from "../store/tradingStore"

export default function ChartOverlay({ series }) {
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
  // DRAW (FINAL FIX)
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orders.forEach((o) => {
        if (!o.price) return

        const entryY = series.priceToCoordinate(o.price)
        const tpY = series.priceToCoordinate(o.tp)
        const slY = series.priceToCoordinate(o.sl)
        const liqY = series.priceToCoordinate(o.liquidation)

        // 🔥 FIX CORE
        const y = entryY ?? canvas.height / 2

        // ENTRY
        ctx.strokeStyle = o.side === "BUY" ? "#22c55e" : "#ef4444"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()

        // TP
        if (tpY != null) {
          ctx.strokeStyle = "#22c55e"
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(0, tpY)
          ctx.lineTo(canvas.width, tpY)
          ctx.stroke()
        }

        // SL
        if (slY != null) {
          ctx.strokeStyle = "#ef4444"
          ctx.beginPath()
          ctx.moveTo(0, slY)
          ctx.lineTo(canvas.width, slY)
          ctx.stroke()
        }

        ctx.setLineDash([])

        // LIQ
        if (liqY != null) {
          ctx.strokeStyle = "#facc15"
          ctx.beginPath()
          ctx.moveTo(0, liqY)
          ctx.lineTo(canvas.width, liqY)
          ctx.stroke()
        }

        // RR BOX
        if (tpY != null && slY != null) {
          ctx.fillStyle = "rgba(34,197,94,0.15)"
          ctx.fillRect(0, tpY, canvas.width, y - tpY)

          ctx.fillStyle = "rgba(239,68,68,0.15)"
          ctx.fillRect(0, y, canvas.width, slY - y)
        }
      })

      requestAnimationFrame(draw)
    }

    draw()
  }, [orders, series])

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
