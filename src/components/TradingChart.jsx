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
  // INIT CHART (FIX)
  // ===============================
  useEffect(() => {
    if (widgetRef.current) return

    const init = () => {
      const widget = new window.TradingView.widget({
        symbol: pair,
        interval: "1",
        container_id: "tv_chart",
        autosize: true,
        theme: "dark"
      })

      widget.onChartReady(() => {
        console.log("✅ Chart READY")
        chartRef.current = widget.chart()
      })

      widgetRef.current = widget
    }

    if (!window.TradingView) {
      const script = document.createElement("script")
      script.src = "https://s3.tradingview.com/tv.js"
      script.onload = init
      document.body.appendChild(script)
    } else {
      init()
    }
  }, [])

  // ===============================
  // SIMULASI LIVE PRICE
  // ===============================
  useEffect(() => {
    const i = setInterval(() => {
      setLivePrice(100000 + Math.random() * 500)
    }, 1000)
    return () => clearInterval(i)
  }, [])

  // ===============================
  // CONNECT ORDER → CHART
  // ===============================
  useEffect(() => {
    if (!chartRef.current) return

    const chart = chartRef.current

    // ENTRY
    orders.forEach(order => {
      const key = "entry_" + order.id

      if (!shapesRef.current[key]) {
        const shape = chart.createShape(
          { price: order.price },
          {
            shape: "horizontal_line",
            text: `ENTRY ${order.side}`
          }
        )

        shape.onClick(() => cancelOrder(order.id))
        shapesRef.current[key] = shape
      }
    })

    // TP
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

    // SL
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

  }, [orders, tpLines, slLines, livePrice])

  return <div id="tv_chart" style={{ height: "100%" }} />
}
