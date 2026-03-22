let ws = null

export const connectBinanceWS = (onCandle) => {
  if (ws) ws.close()

  ws = new WebSocket(
    "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
  )

  ws.onopen = () => {
    console.log("✅ Binance WS Connected")
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)

    const k = data.k

    const candle = {
      time: k.t / 1000,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
    }

    onCandle(candle, parseFloat(k.c))
  }

  ws.onclose = () => {
    console.log("❌ WS Closed → Reconnecting...")
    setTimeout(() => connectBinanceWS(onCandle), 2000)
  }

  ws.onerror = (err) => {
    console.error("WS Error", err)
    ws.close()
  }
}
