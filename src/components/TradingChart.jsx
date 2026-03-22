import React, { useEffect, useRef, useState } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"

const TradingChart = () => {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const candleRef = useRef(null)

  const priceLinesRef = useRef({})
  const areaSeriesRef = useRef(null)

  const [dragging, setDragging] = useState(null)

  const { orders, updateOrder } = useTradingStore()

  // ===============================
  // INIT CHART
  // ===============================
  useEffect(() => {
    if (chartRef.current) return

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 500,
      layout: { background: { color: "#0a0a0a" }, textColor: "#DDD" },
    })

    const candle = chart.addCandlestickSeries()

    chartRef.current = chart
    candleRef.current = candle

    candle.setData([
      { time: "2024-01-01", open: 100, high: 110, low: 90, close: 105 },
    ])

    // ===============================
    // CROSSHAIR MOVE (DRAG ENGINE)
    // ===============================
    chart.subscribeCrosshairMove((param) => {
      if (!dragging || !param?.seriesPrices) return

      const price = param.seriesPrices.get(candle)
      if (!price) return

      const { index, type } = dragging

      updateOrder(index, {
        [type]: price,
      })
    })

    // mouse up stop drag
    const stopDrag = () => setDragging(null)
    window.addEventListener("mouseup", stopDrag)

    return () => {
      window.removeEventListener("mouseup", stopDrag)
      chart.remove()
    }
  }, [])

  // ===============================
  // DRAW LINES (ENTRY / TP / SL)
  // ===============================
  useEffect(() => {
    if (!candleRef.current) return

    // clear old
    Object.values(priceLinesRef.current).forEach((line) =>
      candleRef.current.removePriceLine(line)
    )

    priceLinesRef.current = {}

    orders.forEach((order, i) => {
      // ENTRY
      const entry = candleRef.current.createPriceLine({
        price: order.price,
        color: "#ffaa00",
        lineWidth: 2,
        title: "ENTRY",
      })

      // TP
      const tp = candleRef.current.createPriceLine({
        price: order.tp,
        color: "#00ff88",
        lineWidth: 2,
        title: "TP",
      })

      // SL
      const sl = candleRef.current.createPriceLine({
        price: order.sl,
        color: "#ff4444",
        lineWidth: 2,
        title: "SL",
      })

      // attach click event via DOM overlay hack
      attachDrag(entry, i, "price")
      attachDrag(tp, i, "tp")
      attachDrag(sl, i, "sl")

      priceLinesRef.current[`entry-${i}`] = entry
      priceLinesRef.current[`tp-${i}`] = tp
      priceLinesRef.current[`sl-${i}`] = sl
    })
  }, [orders])

  // ===============================
  // DRAG HANDLER
  // ===============================
  const attachDrag = (line, index, type) => {
    // hack: detect near price click via crosshair
    containerRef.current.addEventListener("mousedown", () => {
      setDragging({ index, type })
    })
  }

  // ===============================
  // RISK REWARD BOX (AREA)
  // ===============================
  useEffect(() => {
    if (!chartRef.current || orders.length === 0) return

    if (areaSeriesRef.current) {
      chartRef.current.removeSeries(areaSeriesRef.current)
    }

    const order = orders[0]

    const area = chartRef.current.addAreaSeries({
      topColor: "rgba(0,255,136,0.2)",
      bottomColor: "rgba(255,68,68,0.2)",
      lineColor: "transparent",
    })

    area.setData([
      { time: "2024-01-01", value: order.tp },
      { time: "2025-01-01", value: order.tp },
    ])

    areaSeriesRef.current = area
  }, [orders])

  return <div ref={containerRef} style={{ width: "100%", height: 500 }} />
}

export default TradingChart
