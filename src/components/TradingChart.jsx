import { useEffect, useRef, useContext } from "react"
import { TradingContext } from "../store/tradingStore.jsx"

export default function TradingChart({ pair }){

const chartRef = useRef(null)

const {
orderLines,
tpLines,
slLines,
liquidationLines,
livePrice,
setOrderLines
} = useContext(TradingContext)

useEffect(()=>{

if(typeof window === "undefined") return
if(!window.TradingView) return

const widget = new window.TradingView.widget({

container_id:"tradingview_chart",

symbol:"BINANCE:"+pair,

interval:"15",

theme:"dark",

style:"1",

locale:"en",

autosize:true,

toolbar_bg:"#0b0e11",

enable_publishing:false

})

setTimeout(()=>{

if(!widget.chart) return

const chart = widget.chart()

/* =========================
ORDER LINES
========================= */

orderLines.forEach(line=>{

const shape = chart.createShape(

{ price: line.price },

{
shape:"horizontal_line",
text:line.side,
color: line.side==="BUY" ? "green" : "red",
lock:false
}

)

/* cancel order when clicked */

shape.on("click",()=>{

setOrderLines(prev=>prev.filter(l=>l.price!==line.price))

})

})

/* =========================
TP LINES
========================= */

tpLines.forEach(line=>{

chart.createShape(

{ price: line.price },

{
shape:"horizontal_line",
text:"TP",
color:"blue"
}

)

})

/* =========================
SL LINES
========================= */

slLines.forEach(line=>{

chart.createShape(

{ price: line.price },

{
shape:"horizontal_line",
text:"SL",
color:"orange"
}

)

})

/* =========================
LIQUIDATION
========================= */

liquidationLines.forEach(line=>{

chart.createShape(

{ price: line.price },

{
shape:"horizontal_line",
text:"LIQ",
color:"purple"
}

)

})

/* =========================
LIVE PRICE
========================= */

if(livePrice){

chart.createShape(

{ price: livePrice },

{
shape:"horizontal_line",
text:"LIVE",
color:"yellow"
}

)

}

},2000)

},[
pair,
orderLines,
tpLines,
slLines,
liquidationLines,
livePrice
])

return(

<div
id="tradingview_chart"
ref={chartRef}
style={{width:"100%",height:"100%"}}
/>

)

}
