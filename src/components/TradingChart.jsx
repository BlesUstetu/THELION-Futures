import { useEffect, useRef } from "react"

export default function TradingChart({ pair }) {

  const chartRef = useRef(null)

  useEffect(() => {

    if (typeof window === "undefined") return
    if (!window.TradingView) return

    new window.TradingView.widget({

      container_id: chartRef.current,

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
      ref={chartRef}
      style={{ width: "100%", height: "100%" }}
    />
  )
}
