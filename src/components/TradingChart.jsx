import { useEffect, useRef } from "react"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef(null)
  const widgetRef = useRef(null)

  const { pair } = useTrading()

  useEffect(() => {
    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.TradingView) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "https://s3.tradingview.com/tv.js"
        script.onload = resolve
        document.body.appendChild(script)
      })
    }

    const initChart = async () => {
      await loadScript()

      // 🔥 tunggu DOM benar-benar ada
      setTimeout(() => {
        const container = document.getElementById("tv_chart")

        if (!container) {
          console.error("❌ tv_chart NOT FOUND")
          return
        }

        widgetRef.current = new window.TradingView.widget({
          symbol: pair,
          interval: "1",
          container_id: "tv_chart",
          autosize: true,
          theme: "dark"
        })

        widgetRef.current.onChartReady(() => {
          console.log("✅ Chart READY (FIXED)")
          chartRef.current = widgetRef.current.chart()
        })
      }, 300) // delay penting
    }

    initChart()
  }, [])

  return (
    <div
      id="tv_chart"
      style={{
        width: "100%",
        height: "600px", // ⚠️ WAJIB ADA HEIGHT
      }}
    />
  )
}
