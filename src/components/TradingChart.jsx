import { useEffect, useRef } from "react"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const chartRef = useRef(null)
  const shapesRef = useRef({})

  const {
    pair,
    orders,
    tpLines,
    slLines,
    cancelOrder,
    updateTP,
    updateSL,
    livePrice,
    setLivePrice
  } = useTrading()

  // ===============================
  // INIT CHART (ONLY ONCE)
  // ===============================
  useEffect(() => {
    if (widgetRef.current) return

    const initChart = () => {
      widgetRef.current = new window.TradingView.widget({
        symbol: pair,
        interval: "1",
        container_id: "tv_chart",
        autosize: true,
        theme: "dark"
      })

      widgetRef.current.onChartReady(() => {
        chartRef.current = widgetRef.current.chart()
        console.log("✅ Chart Ready")
      })
    }

    if (!window.TradingView) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/tv.js"
      script.onload = initChart
      document.body.appendChild(script)
    } else {
      initChart()
    }
  }, [])

  // ===============================
  // LIVE PRICE SIMULATION
  // ===============================
  useEffect(() => {
    const i = setInterval(() => {
      setLivePrice(100000 + Math.random() * 500)
    }, 1000)
    return () => clearInterval(i)
  }, [])

  // ===============================
  // SYNC CHART WITH STATE (CORE)
  // ===============================
  useEffect(() => {
    if (!chartRef.current) return

    const chart = chartRef.current

    // ===== ENTRY =====
    orders.forEach(order => {
      const key = "entry_" + order.id

      if (!shapesRef.current[key]) {
        const shape = chart.createShape(
          { price: order.price },
          {
            shape: "horizontal_line",
            text: `ENTRY ${order.side}`,
            lock: false
          }
        )

        shape.onClick(() => {
          cancelOrder(order.id)
        })

        shapesRef.current[key] = shape
      }
    })

    // ===== REMOVE OLD ENTRY =====
    Object.keys(shapesRef.current).forEach(key => {
      if (key.startsWith("entry_")) {
        const id = key.replace("entry_", "")
        if (!orders.find(o => o.id.toString() === id)) {
          chart.removeEntity(shapesRef.current[key])
          delete shapesRef.current[key]
        }
      }
    })

    // ===== TP =====
    tpLines.forEach(tp => {
      const key = "tp_" + tp.id

      if (!shapesRef.current[key]) {
        const shape = chart.createShape(
          { price: tp.price },
          {
            shape: "horizontal_line",
            text: "TP",
            overrides: { linecolor: "#00ff88" }
          }
        )

        shape.onMove(() => {
          updateTP(tp.id, shape.getPrice())
        })

        shapesRef.current[key] = shape
      } else {
        shapesRef.current[key].setPrice(tp.price)
      }
    })

    // ===== SL =====
    slLines.forEach(sl => {
      const key = "sl_" + sl.id

      if (!shapesRef.current[key]) {
        const shape = chart.createShape(
          { price: sl.price },
          {
            shape: "horizontal_line",
            text: "SL",
            overrides: { linecolor: "#ff0000" }
          }
        )

        shape.onMove(() => {
          updateSL(sl.id, shape.getPrice())
        })

        shapesRef.current[key] = shape
      } else {
        shapesRef.current[key].setPrice(sl.price)
      }
    })

    // ===== LIVE PRICE =====
    if (livePrice) {
      if (!shapesRef.current.live) {
        shapesRef.current.live = chart.createShape(
          { price: livePrice },
          {
            shape: "horizontal_line",
            text: "LIVE",
            overrides: { linecolor: "#ffffff" }
          }
        )
      } else {
        shapesRef.current.live.setPrice(livePrice)
      }
    }

  }, [orders, tpLines, slLines, livePrice])

  return (
    <div
      id="tv_chart"
      ref={containerRef}
      style={{ height: "100%", width: "100%" }}
    />
  )
}
