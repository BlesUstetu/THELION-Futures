import { useEffect, useRef } from "react"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef(null)
  const widgetRef = useRef(null)
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
  // INIT CHART
  // ===============================
  useEffect(() => {
    if (widgetRef.current) return

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.onload = () => {
      widgetRef.current = new window.TradingView.widget({
        symbol: pair,
        interval: "1",
        container_id: "tv_chart",
        autosize: true,
        theme: "dark"
      })
    }

    document.body.appendChild(script)
  }, [])

  // ===============================
  // SIMULATE LIVE PRICE
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(100000 + Math.random() * 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // ===============================
  // DRAW LINES (NO FLICKER)
  // ===============================
  useEffect(() => {
    if (!widgetRef.current) return

    widgetRef.current.onChartReady(() => {
      const chart = widgetRef.current.chart()

      // ENTRY
      orders.forEach(order => {
        if (!shapesRef.current["entry_" + order.id]) {
          const shape = chart.createShape(
            { price: order.price },
            {
              shape: "horizontal_line",
              text: `ENTRY ${order.side}`,
              lock: false
            }
          )

          shape.onClick(() => cancelOrder(order.id))

          shapesRef.current["entry_" + order.id] = shape
        }
      })

      // TP
      tpLines.forEach(tp => {
        if (!shapesRef.current["tp_" + tp.id]) {
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

          shapesRef.current["tp_" + tp.id] = shape
        }
      })

      // SL
      slLines.forEach(sl => {
        if (!shapesRef.current["sl_" + sl.id]) {
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

          shapesRef.current["sl_" + sl.id] = shape
        }
      })

      // LIVE PRICE
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
    })
  }, [orders, tpLines, slLines, livePrice])

  return <div id="tv_chart" style={{ height: "100%" }} />
}
