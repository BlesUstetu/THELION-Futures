import React, { useEffect, useRef } from "react"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef(null)
  const widgetRef = useRef(null)
  const tvChartRef = useRef(null)
  const shapesRef = useRef({})

  const {
    pair,
    orders,
    tpLines,
    slLines,
    liquidationLines,
    livePrice,
    cancelOrder,
    updateTP,
    updateSL
  } = useTrading()

  // ===============================
  // INIT CHART (ONLY ONCE)
  // ===============================
  useEffect(() => {
    if (widgetRef.current) return

    const widget = new window.TradingView.widget({
      symbol: pair || "BINANCE:BTCUSDT",
      interval: "15",
      container_id: "tv_chart",
      autosize: true,
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
    })

    widgetRef.current = widget

    widget.onChartReady(() => {
      tvChartRef.current = widget.chart()
    })

    return () => {
      widgetRef.current?.remove()
      widgetRef.current = null
    }
  }, [])

  // ===============================
  // UPDATE SYMBOL (NO RECREATE)
  // ===============================
  useEffect(() => {
    if (!tvChartRef.current) return
    tvChartRef.current.setSymbol(pair, () => {})
  }, [pair])

  // ===============================
  // DRAW ALL LINES
  // ===============================
  useEffect(() => {
    if (!tvChartRef.current) return

    const chart = tvChartRef.current

    // CLEAR OLD SHAPES
    Object.values(shapesRef.current).forEach(shape => {
      try {
        chart.removeEntity(shape)
      } catch {}
    })

    shapesRef.current = {}

    // ================= ENTRY
    orders.forEach(order => {
      const shape = chart.createShape(
        { price: order.price },
        {
          shape: "horizontal_line",
          text: `ENTRY ${order.side}`,
          lock: false,
          overrides: {
            linecolor: order.side === "BUY" ? "#00ff88" : "#ff3b3b",
            linewidth: 2,
          }
        }
      )

      shapesRef.current[`order_${order.id}`] = shape

      // CANCEL ON CLICK
      shape.onClick(() => cancelOrder(order.id))
    })

    // ================= TP
    tpLines.forEach(tp => {
      const shape = chart.createShape(
        { price: tp.price },
        {
          shape: "horizontal_line",
          text: "TP",
          lock: false,
          overrides: {
            linecolor: "#00c3ff",
            linestyle: 2,
          }
        }
      )

      shapesRef.current[`tp_${tp.id}`] = shape

      shape.onMove(() => {
        const price = shape.getPrice()
        updateTP(tp.id, price)
      })
    })

    // ================= SL
    slLines.forEach(sl => {
      const shape = chart.createShape(
        { price: sl.price },
        {
          shape: "horizontal_line",
          text: "SL",
          lock: false,
          overrides: {
            linecolor: "#ff0000",
          }
        }
      )

      shapesRef.current[`sl_${sl.id}`] = shape

      shape.onMove(() => {
        const price = shape.getPrice()
        updateSL(sl.id, price)
      })
    })

    // ================= LIQUIDATION
    liquidationLines.forEach(liq => {
      const shape = chart.createShape(
        { price: liq.price },
        {
          shape: "horizontal_line",
          text: "LIQ",
          lock: true,
          overrides: {
            linecolor: "#ff9900",
            linestyle: 3,
          }
        }
      )

      shapesRef.current[`liq_${liq.id}`] = shape
    })

    // ================= LIVE PRICE
    if (livePrice) {
      const shape = chart.createShape(
        { price: livePrice },
        {
          shape: "horizontal_line",
          text: "LIVE",
          lock: true,
          overrides: {
            linecolor: "#ffffff",
            linestyle: 1,
          }
        }
      )

      shapesRef.current["live"] = shape
    }

  }, [orders, tpLines, slLines, liquidationLines, livePrice])

  return (
    <div
      id="tv_chart"
      ref={chartRef}
      style={{ width: "100%", height: "100%" }}
    />
  )
}
