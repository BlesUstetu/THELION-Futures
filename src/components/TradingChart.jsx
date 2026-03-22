import React, { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTradingStore } from "../store/tradingStore"

const TradingChart = () => {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const lineSeriesRef = useRef({})

  const { orders, pair } = useTradingStore()

  // ===============================
  // INIT CHART (ONLY ONCE)
  // ===============================
  useEffect(() => {
    if (chartRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0a0a0a" },
        textColor: "#DDD",
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#333",
      },
      timeScale: {
        borderColor: "#333",
        timeVisible: true,
      },
    })

    const candleSeries = chart.addCandlestickSeries()

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    // dummy data awal (anti blank)
    candleSeries.setData([
      { time: "2024-01-01", open: 100, high: 110, low: 90, close: 105 },
    ])

    // resize fix
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // ===============================
  // UPDATE CANDLE (SIMULASI / API NANTI)
  // ===============================
  useEffect(() => {
    if (!candleSeriesRef.current) return

    // contoh update dummy (nanti ganti websocket)
    const interval = setInterval(() => {
      const time = new Date().toISOString().slice(0, 10)
      const price = 100 + Math.random() * 20

      candleSeriesRef.current.update({
        time,
        open: price - 5,
        high: price + 5,
        low: price - 10,
        close: price,
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // ===============================
  // DRAW ORDER LINES (ENTRY / TP / SL)
  // ===============================
  useEffect(() => {
    if (!chartRef.current) return

    // clear old lines
    Object.values(lineSeriesRef.current).forEach((line) => {
      chartRef.current.removeSeries(line)
    })

    lineSeriesRef.current = {}

    orders.forEach((order, index) => {
      const line = chartRef.current.addLineSeries({
        color:
          order.type === "buy"
            ? "#00ff88"
            : order.type === "sell"
            ? "#ff4444"
            : "#ffaa00",
        lineWidth: 2,
        priceLineVisible: true,
      })

      line.setData([
        { time: "2024-01-01", value: order.price },
        { time: "2025-01-01", value: order.price },
      ])

      lineSeriesRef.current[`order-${index}`] = line
    })
  }, [orders])

  // ===============================
  // LIVE PRICE LINE
  // ===============================
  useEffect(() => {
    if (!candleSeriesRef.current) return

    const priceLine = candleSeriesRef.current.createPriceLine({
      price: 100,
      color: "#2962FF",
      lineWidth: 2,
      lineStyle: 2,
      axisLabelVisible: true,
      title: "LIVE",
    })

    return () => {
      candleSeriesRef.current.removePriceLine(priceLine)
    }
  }, [])

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: "100%",
        height: "500px",
      }}
    />
  )
}

export default TradingChart
