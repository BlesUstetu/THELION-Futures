import { useEffect, useRef, useContext } from "react"
import { TradingContext } from "../store/tradingStore.jsx"

export default function TradingChart({ pair }){

const chartRef = useRef(null)
const widgetRef = useRef(null)

const {
orderLines,
tpLines,
slLines,
liquidationLines,
livePrice
} = useContext(TradingContext)

/* create chart only once */

useEffect(()=>{

if(!window.TradingView) return

widgetRef.current = new window.TradingView.widget({

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

},[pair])

/* draw lines */

useEffect(()=>{

if(!widgetRef.current) return

const chart = widgetRef.current.chart()

if(!chart) return

/* order lines */

orderLines.forEach(line=>{

chart.createShape(
{ price: line.price },
{
shape:"horizontal_line",
text:line.side,
color: line.side==="BUY" ? "green":"red",
lock:false
}
)

})

/* TP */

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

/* SL */

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

/* liquidation */

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

/* live price */

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

},[
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
