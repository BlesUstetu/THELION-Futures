import { useEffect, useRef, useContext } from "react"
import { TradingContext } from "../store/tradingStore.jsx"

export default function TradingChart({ pair }) {

  const chartContainerRef = useRef(null)
  const widgetRef = useRef(null)

  const { orderLines } = useContext(TradingContext)

  /* ===============================
     CREATE WIDGET (ONLY ONCE)
  =============================== */

  useEffect(() => {

    if (!window.TradingView) return

    if (widgetRef.current) {
      widgetRef.current.remove()
      widgetRef.current = null
    }

    widgetRef.current = new window.TradingView.widget({

      symbol: "BINANCE:" + pair,

      interval: "15",

      container_id: "tradingview_chart",

      theme: "dark",

      style: "1",

      locale: "en",

      autosize: true,

      toolbar_bg: "#0b0e11",

      enable_publishing: false,

      hide_top_toolbar: false,

      hide_legend: false,

      save_image: false
    })

    widgetRef.current.onChartReady(() => {

      console.log("Chart Ready")

    })

    return () => {

      if (widgetRef.current) {

        widgetRef.current.remove()
        widgetRef.current = null

      }

    }

  }, [pair])

  /* ===============================
     DRAW ORDER LINES
  =============================== */

  useEffect(() => {

    const widget = widgetRef.current

    if (!widget) return

    widget.onChartReady(() => {

      const chart = widget.chart()

      try {

        orderLines.forEach(line => {

          chart.createShape(
            { price: line.price },
            {
              shape: "horizontal_line",
              text: line.side,
              color: line.side === "BUY" ? "#00ff9c" : "#ff4976",
              disableSelection: true,
              disableSave: true,
              lock: true
            }
          )

        })

      } catch (e) {

        console.log("order line error")

      }

    })

  }, [orderLines])

  return (

    <div
      id="tradingview_chart"
      ref={chartContainerRef}
      style={{
        width: "100%",
        height: "100%"
      }}
    />

  )

}
