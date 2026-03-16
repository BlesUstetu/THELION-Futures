import { useEffect, useRef, useContext } from "react"
import { createChart } from "lightweight-charts"
import { TradingContext } from "../store/tradingStore.jsx"

export default function StableChart(){

const chartContainer = useRef()
const chartRef = useRef()
const candleSeriesRef = useRef()

const {
orderLines,
tpLines,
slLines,
liquidationLines,
livePrice
} = useContext(TradingContext)

useEffect(()=>{

/* create chart */

chartRef.current = createChart(chartContainer.current,{
layout:{
background:{color:"#0b0e11"},
textColor:"#d1d4dc"
},
grid:{
vertLines:{color:"#1f2937"},
horzLines:{color:"#1f2937"}
},
width:chartContainer.current.clientWidth,
height:500
})

/* candlestick series */

candleSeriesRef.current = chartRef.current.addCandlestickSeries()

/* load initial candles */

fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=200")
.then(res=>res.json())
.then(data=>{

const candles = data.map(c=>({
time:c[0]/1000,
open:parseFloat(c[1]),
high:parseFloat(c[2]),
low:parseFloat(c[3]),
close:parseFloat(c[4])
}))

candleSeriesRef.current.setData(candles)

})

/* realtime websocket */

const ws = new WebSocket(
"wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
)

ws.onmessage=(event)=>{

const message = JSON.parse(event.data)

const k = message.k

const candle = {
time:k.t/1000,
open:parseFloat(k.o),
high:parseFloat(k.h),
low:parseFloat(k.l),
close:parseFloat(k.c)
}

candleSeriesRef.current.update(candle)

}

/* resize */

const resizeObserver = new ResizeObserver(entries=>{

const { width,height } = entries[0].contentRect

chartRef.current.applyOptions({ width,height })

})

resizeObserver.observe(chartContainer.current)

return ()=>{

ws.close()
chartRef.current.remove()

}

},[])

/* draw price lines */

useEffect(()=>{

if(!candleSeriesRef.current) return

/* order lines */

orderLines.forEach(line=>{

candleSeriesRef.current.createPriceLine({
price:line.price,
color:line.side==="BUY" ? "green":"red",
lineWidth:2,
title:line.side
})

})

/* TP */

tpLines.forEach(line=>{

candleSeriesRef.current.createPriceLine({
price:line.price,
color:"blue",
lineWidth:1,
title:"TP"
})

})

/* SL */

slLines.forEach(line=>{

candleSeriesRef.current.createPriceLine({
price:line.price,
color:"orange",
lineWidth:1,
title:"SL"
})

})

/* liquidation */

liquidationLines.forEach(line=>{

candleSeriesRef.current.createPriceLine({
price:line.price,
color:"purple",
lineWidth:1,
title:"LIQ"
})

})

/* live price */

if(livePrice){

candleSeriesRef.current.createPriceLine({
price:livePrice,
color:"yellow",
lineWidth:1,
title:"LIVE"
})

}

},[
orderLines,
tpLines,
slLines,
liquidationLines,
livePrice
])

return(

<div
ref={chartContainer}
style={{width:"100%",height:"100%"}}
/>

)

}
