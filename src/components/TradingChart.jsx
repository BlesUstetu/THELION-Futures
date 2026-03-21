import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"
import { useTrading } from "../store/tradingStore"

export default function TradingChart() {
  const chartRef = useRef()
  const candleSeriesRef = useRef()
  const emaSeriesRef = useRef()

  const linesRef = useRef({})
  const livePriceRef = useRef(0)
  const lastTimeRef = useRef(0)
  const emaValueRef = useRef(null)

  const { orders, tpLines, slLines, pair, timeframe } = useTrading()

  // ===============================
  // LOAD HISTORY
  // ===============================
  const loadHistory = async () => {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${pair.toUpperCase()}&interval=${timeframe}&limit=200`
    )
    const data = await res.json()

    return data.map(d => ({
      time: Math.floor(d[0] / 1000),
      open: +d[1],
      high: +d[2],
      low: +d[3],
      close: +d[4]
    }))
  }

  // ===============================
  // INIT CHART
  // ===============================
  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0b0f14" },
        textColor: "#ccc"
      },
      grid: {
        vertLines: { color: "#1e222d" },
        horzLines: { color: "#1e222d" }
      }
    })

    const candle = chart.addCandlestickSeries()
    const ema = chart.addLineSeries({
      color: "#ffaa00",
      lineWidth: 2
    })

    candleSeriesRef.current = candle
    emaSeriesRef.current = ema

    let ws

    const init = async () => {
      const history = await loadHistory()

      if (!history || history.length === 0) return

      candle.setData(history)
      chart.timeScale().fitContent()

      const last = history[history.length - 1]
      livePriceRef.current = last.close
      lastTimeRef.current = last.time

      // ===============================
      // WEBSOCKET
      // ===============================
      ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${pair}@kline_${timeframe}`
      )

      ws.onmessage = (e) => {
        const k = JSON.parse(e.data).k

        const time = Math.floor(k.t / 1000)
        const price = +k.c

        // 🚨 FILTER BUG DATA
        if (price < 1000) return

        const candleData = {
          time,
          open: +k.o,
          high: +k.h,
          low: +k.l,
          close: price
        }

        livePriceRef.current = price

        // ANTI HILANG CANDLE
        if (time >= lastTimeRef.current) {
          candle.update(candleData)
          lastTimeRef.current = time
        }

        // ===============================
        // EMA
        // ===============================
        const m = 2 / (14 + 1)

        emaValueRef.current = emaValueRef.current
          ? (price - emaValueRef.current) * m + emaValueRef.current
          : price

        ema.update({
          time,
          value: emaValueRef.current
        })
      }
    }

    init()

    return () => {
      ws && ws.close()
      chart.remove()
    }
  }, [pair, timeframe])

  // ===============================
  // DRAW TRADING LINES
  // ===============================
  useEffect(() => {
    const s = candleSeriesRef.current
    if (!s) return

    const pnl = (entry, price, side, amt = 1) =>
      side === "BUY" ? (price - entry) * amt : (entry - price) * amt

    const liq = (entry, lev, side) =>
      side === "BUY"
        ? entry * (1 - 1 / lev)
        : entry * (1 + 1 / lev)

    orders.forEach(o => {
      const key = "entry_" + o.id
      const p = pnl(o.price, livePriceRef.current, o.side, o.amount)

      if (!linesRef.current[key]) {
        linesRef.current[key] = s.createPriceLine({
          price: o.price
        })
      }

      linesRef.current[key].applyOptions({
        price: o.price,
        color: p > 0 ? "#00ff88" : "#ff4444",
        title: `ENTRY ${o.side} | ${p.toFixed(2)}`
      })

      const liqKey = "liq_" + o.id
      const liqPrice = liq(o.price, 10, o.side)

      if (!linesRef.current[liqKey]) {
        linesRef.current[liqKey] = s.createPriceLine({
          price: liqPrice,
          color: "#ff8800",
          title: "LIQ"
        })
      }

      linesRef.current[liqKey].applyOptions({
        price: liqPrice
      })
    })

    tpLines.forEach(tp => {
      const key = "tp_" + tp.id

      if (!linesRef.current[key]) {
        linesRef.current[key] = s.createPriceLine({
          price: tp.price,
          color: "#00ff88",
          lineStyle: 2,
          title: "TP"
        })
      }

      linesRef.current[key].applyOptions({
        price: tp.price
      })
    })

    slLines.forEach(sl => {
      const key = "sl_" + sl.id

      if (!linesRef.current[key]) {
        linesRef.current[key] = s.createPriceLine({
          price: sl.price,
          color: "#ff0000",
          lineStyle: 2,
          title: "SL"
        })
      }

      linesRef.current[key].applyOptions({
        price: sl.price
      })
    })
  }, [orders, tpLines, slLines])

  return <div ref={chartRef} style={{ width: "100%" }} />
}
