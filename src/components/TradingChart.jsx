import { useEffect, useRef } from "react"

export default function TradingChart({ pair }) {

  const chartRef = useRef(null)

  useEffect(() => {

    if (!chartRef.current) return
    if (!window.TradingView) return

    const widget = new window.TradingView.widget({

      container_id: chartRef.current.id,

      symbol: "BINANCE:" + pair,

      interval: "15",

      theme: "dark",

      style: "1",

      locale: "en",

      autosize: true

    })

  }, [pair])

  return (

    <div
      id="tradingview_chart"
      ref={chartRef}
      style={{
        width:"100%",
        height:"100%"
      }}
    />

  )

}
