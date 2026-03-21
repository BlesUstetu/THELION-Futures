import { useEffect, useRef } from "react"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartContainerRef = useRef()
  const widgetRef = useRef(null)
  const shapesRef = useRef({})

  const {
    pair,
    orders,
    tpLines,
    slLines,
    cancelOrder,
    updateTP,
    updateSL
  } = useTrading()

  // ===============================
  // INIT CHARTING LIBRARY
  // ===============================
  useEffect(() => {
    if (widgetRef.current) return

    const widget = new window.TradingView.widget({
      symbol: pair,
      interval: "1",
      container: chartContainerRef.current,
      library_path: "/charting_library/",
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed("/datafeeds"),
      locale: "en",
      autosize: true,
      theme: "dark"
    })

    widget.onChartReady(() => {
      console.log("✅ Charting Library READY")

      widgetRef.current = widget
    })
  }, [])

  // ===============================
  // DRAW ORDER LINES
  // ===============================
  useEffect(() => {
    if (!widgetRef.current) return

    const chart = widgetRef.current.chart()

    // ENTRY
    orders.forEach(order => {
      const key = "entry_" + order.id

      if (!shapesRef.current[key]) {
        const line = chart
          .createOrderLine()
          .setPrice(order.price)
          .setText(`ENTRY ${order.side}`)
          .setQuantity(order.amount)

        line.onCancel(() => cancelOrder(order.id))

        shapesRef.current[key] = line
      }
    })

    // TP
    tpLines.forEach(tp => {
      const key = "tp_" + tp.id

      if (!shapesRef.current[key]) {
        const line = chart
          .createOrderLine()
          .setPrice(tp.price)
          .setText("TP")
          .setLineColor("#00ff88")

        line.onMove(() => {
          updateTP(tp.id, line.getPrice())
        })

        shapesRef.current[key] = line
      } else {
        shapesRef.current[key].setPrice(tp.price)
      }
    })

    // SL
    slLines.forEach(sl => {
      const key = "sl_" + sl.id

      if (!shapesRef.current[key]) {
        const line = chart
          .createOrderLine()
          .setPrice(sl.price)
          .setText("SL")
          .setLineColor("#ff0000")

        line.onMove(() => {
          updateSL(sl.id, line.getPrice())
        })

        shapesRef.current[key] = line
      } else {
        shapesRef.current[key].setPrice(sl.price)
      }
    })

  }, [orders, tpLines, slLines])

  return (
    <div
      ref={chartContainerRef}
      style={{ height: "100%", width: "100%" }}
    />
  )
}
