import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef()
  const candleSeriesRef = useRef()
  const emaSeriesRef = useRef()
  const rsiSeriesRef = useRef()

  const linesRef = useRef({})
  const dragRef = useRef(null)
  const livePriceRef = useRef(0)

  const emaValueRef = useRef(null)
  const gainsRef = useRef([])
  const lossesRef = useRef([])

  const {
    orders,
    tpLines,
    slLines,
    cancelOrder,
    updateTP,
    updateSL,
    updateEntry,
    pair,
    timeframe
  } = useTrading()

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 500,
      layout: { background: { color: "#0b0f14" }, textColor: "#ccc" },
      grid: { vertLines: { color: "#1e222d" }, horzLines: { color: "#1e222d" } }
    })

    const candle = chart.addCandlestickSeries()
    const ema = chart.addLineSeries({ color: "#ffaa00" })
    const rsi = chart.addLineSeries({ color: "#00aaff" })

    candleSeriesRef.current = candle
    emaSeriesRef.current = ema
    rsiSeriesRef.current = rsi

    // ===============================
    // WEBSOCKET (PAIR + TF)
    // ===============================
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${pair}@kline_${timeframe}`
    )

    ws.onmessage = (e) => {
      const k = JSON.parse(e.data).k

      const price = parseFloat(k.c)
      livePriceRef.current = price

      const candleData = {
        time: Math.floor(k.t / 1000),
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: price
      }

      candle.update(candleData)

      // EMA
      const m = 2 / (14 + 1)
      emaValueRef.current = emaValueRef.current
        ? (price - emaValueRef.current) * m + emaValueRef.current
        : price

      ema.update({ time: candleData.time, value: emaValueRef.current })

      // RSI
      const prev = livePriceRef.prev || price
      const diff = price - prev

      gainsRef.current.push(Math.max(diff, 0))
      lossesRef.current.push(Math.max(-diff, 0))

      if (gainsRef.current.length > 14) gainsRef.current.shift()
      if (lossesRef.current.length > 14) lossesRef.current.shift()

      const avgGain = gainsRef.current.reduce((a, b) => a + b, 0) / 14
      const avgLoss = lossesRef.current.reduce((a, b) => a + b, 0) / 14

      const rs = avgGain / (avgLoss || 1)
      const rsiVal = 100 - (100 / (1 + rs))

      rsi.update({ time: candleData.time, value: rsiVal })

      livePriceRef.prev = price
    }

    return () => {
      ws.close()
      chart.remove()
    }
  }, [pair, timeframe])

  // ===============================
  // DRAW LINES
  // ===============================
  useEffect(() => {
    const s = candleSeriesRef.current
    if (!s) return

    const pnl = (entry, price, side, amt = 1) =>
      side === "BUY" ? (price - entry) * amt : (entry - price) * amt

    const liq = (entry, lev, side) =>
      side === "BUY" ? entry * (1 - 1 / lev) : entry * (1 + 1 / lev)

    orders.forEach(o => {
      const key = "e_" + o.id
      const p = pnl(o.price, livePriceRef.current, o.side, o.amount)

      if (!linesRef.current[key]) {
        linesRef.current[key] = s.createPriceLine({ price: o.price })
      }

      linesRef.current[key].applyOptions({
        price: o.price,
        color: p > 0 ? "#00ff88" : "#ff4444",
        title: `ENTRY ${o.side} | ${p.toFixed(2)}`
      })

      const lk = "l_" + o.id
      const lp = liq(o.price, 10, o.side)

      if (!linesRef.current[lk]) {
        linesRef.current[lk] = s.createPriceLine({
          price: lp,
          color: "#ff8800",
          title: "LIQ"
        })
      }

      linesRef.current[lk].applyOptions({ price: lp })
    })

    tpLines.forEach(tp => {
      const k = "tp_" + tp.id
      if (!linesRef.current[k]) {
        linesRef.current[k] = s.createPriceLine({
          price: tp.price,
          color: "#00ff88",
          lineStyle: 2,
          title: "TP"
        })
      }
      linesRef.current[k].applyOptions({ price: tp.price })
    })

    slLines.forEach(sl => {
      const k = "sl_" + sl.id
      if (!linesRef.current[k]) {
        linesRef.current[k] = s.createPriceLine({
          price: sl.price,
          color: "#ff0000",
          lineStyle: 2,
          title: "SL"
        })
      }
      linesRef.current[k].applyOptions({ price: sl.price })
    })

  }, [orders, tpLines, slLines])

  return <div ref={chartRef} style={{ width: "100%" }} />
}
