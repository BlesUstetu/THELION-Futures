import { useEffect,useRef,useContext } from "react"
import { createChart } from "lightweight-charts"
import { TradingContext } from "../store/tradingStore.jsx"

export default function StableChart(){

const containerRef = useRef()
const chartRef = useRef()
const candleSeries = useRef()

const { setLivePrice } = useContext(TradingContext)

useEffect(()=>{

/* CREATE CHART */

chartRef.current = createChart(containerRef.current,{
layout:{
background:{color:"#0b0e11"},
textColor:"#d1d4dc"
},
grid:{
vertLines:{color:"#1f2937"},
horzLines:{color:"#1f2937"}
},
width:containerRef.current.clientWidth,
height:500
})

candleSeries.current = chartRef.current.addCandlestickSeries()

/* LOAD HISTORY */

fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=200")
.then(res=>res.json())
.then(data=>{

const candles=data.map(c=>({
time:c[0]/1000,
open:+c[1],
high:+c[2],
low:+c[3],
close:+c[4]
}))

candleSeries.current.setData(candles)

})

/* REALTIME */

const ws = new WebSocket(
"wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
)

ws.onmessage=(event)=>{

const msg = JSON.parse(event.data)
const k = msg.k

const candle={
time:k.t/1000,
open:+k.o,
high:+k.h,
low:+k.l,
close:+k.c
}

candleSeries.current.update(candle)

setLivePrice(Number(k.c))

}

/* RESIZE */

function resize(){
chartRef.current.applyOptions({
width:containerRef.current.clientWidth
})
}

window.addEventListener("resize",resize)

/* CLEANUP */

return ()=>{

ws.close()

window.removeEventListener("resize",resize)

chartRef.current.remove()

}

},[])

return(

<div
ref={containerRef}
style={{width:"100%",height:"500px"}}
/>

)

}
