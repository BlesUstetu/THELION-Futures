import { useEffect, useRef, useContext } from "react"
import { TradingContext } from "../store/tradingStore.jsx"

export default function TradingChart({ pair }){

const chartRef = useRef(null)

const { orderLines } = useContext(TradingContext)

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

enable_publishing:false,

hide_top_toolbar:false

})

/* draw order lines */

setTimeout(()=>{

if(!widget.chart) return

try{

orderLines.forEach(line=>{

widget.chart().createShape(

{ price: line.price },

{
shape:"horizontal_line",
text:line.side,
color: line.side==="BUY" ? "green" : "red",
disableSelection:true,
disableSave:true
}

)

})

}catch(e){

console.log("chart not ready")

}

},2000)

},[pair,orderLines])

return(

<div
id="tradingview_chart"
ref={chartRef}
style={{width:"100%",height:"100%"}}
/>

)

}
