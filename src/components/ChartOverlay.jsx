import { useEffect, useRef } from "react"
import { useTradingStore } from "../store/tradingStore"

export default function ChartOverlay({ chart, series }) {
  const canvasRef = useRef(null)
  const dragRef = useRef({ active: false, type: null, orderId: null })

  const orders = useTradingStore((s) => s.orders)

  // =========================
  // RESIZE CANVAS
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
  // DRAW LOOP (STABLE)
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!series) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orders.forEach((o) => {
        if (!o || o.price == null) return

        const entryY = series.priceToCoordinate(o.price)
        const tpY = series.priceToCoordinate(o.tp)
        const slY = series.priceToCoordinate(o.sl)
        const liqY = series.priceToCoordinate(o.liquidation)

        // 🔥 FIX UTAMA
        if (entryY === null || entryY === undefined) return

        // =========================
        // ENTRY
        // =========================
        ctx.strokeStyle = o.side === "BUY" ? "#22c55e" : "#ef4444"
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.moveTo(0, entryY)
        ctx.lineTo(canvas.width, entryY)
        ctx.stroke()

        // =========================
        // TP
        // =========================
        if (tpY !== null && tpY !== undefined) {
          ctx.strokeStyle = "#22c55e"
          ctx.setLineDash([6, 6])
          ctx.beginPath()
          ctx.moveTo(0, tpY)
          ctx.lineTo(canvas.width, tpY)
          ctx.stroke()
        }

        // =========================
        // SL
        // =========================
        if (slY !== null && slY !== undefined) {
          ctx.strokeStyle = "#ef4444"
          ctx.setLineDash([6, 6])
          ctx.beginPath()
          ctx.moveTo(0, slY)
          ctx.lineTo(canvas.width, slY)
          ctx.stroke()
        }

        // =========================
        // LIQ
        // =========================
        if (liqY !== null && liqY !== undefined) {
          ctx.strokeStyle = "#facc15"
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(0, liqY)
          ctx.lineTo(canvas.width, liqY)
          ctx.stroke()
        }

        ctx.setLineDash([])

        // =========================
        // RR BOX
        // =========================
        if (tpY !== null && slY !== null) {
          // PROFIT AREA
          ctx.fillStyle = "rgba(34,197,94,0.15)"
          ctx.fillRect(0, tpY, canvas.width, entryY - tpY)

          // LOSS AREA
          ctx.fillStyle = "rgba(239,68,68,0.15)"
          ctx.fillRect(0, entryY, canvas.width, slY - entryY)
        }
      })

      requestAnimationFrame(draw)
    }

    draw()
  }, [orders, series])

  // =========================
  // DRAG (ENTRY ONLY - STABLE)
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current
    if (!series) return

    const getPrice = (y) => series.coordinateToPrice(y)

    const handleDown = (e) => {
      const rect = canvas.getBoundingClientRect()
      const y = e.clientY - rect.top

      const { orders } = useTradingStore.getState()

      for (let o of orders) {
        const entryY = series.priceToCoordinate(o.price)
        if (entryY == null) continue

        if (Math.abs(entryY - y) < 10) {
          dragRef.current = {
            active: true,
            type: "entry",
            orderId: o.id,
          }
          return
        }
      }
    }

    const handleMove = (e) => {
      if (!dragRef.current.active) return

      const rect = canvas.getBoundingClientRect()
      const y = e.clientY - rect.top
      const price = getPrice(y)

      if (!price) return

      const store = useTradingStore.getState()

      if (dragRef.current.type === "entry") {
        store.updateOrder(dragRef.current.orderId, { price })
        store.setPrice(price)
      }
    }

    const handleUp = () => {
      dragRef.current.active = false
    }

    canvas.addEventListener("mousedown", handleDown)
    canvas.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      canvas.removeEventListener("mousedown", handleDown)
      canvas.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [series])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10,
        pointerEvents: "auto",
      }}
    />
  )
}
