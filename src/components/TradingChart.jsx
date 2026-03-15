import { useEffect } from "react"

export default function TradingChart({pair}){

useEffect(()=>{

function createChart(){

new window.TradingView.widget({

symbol:`BINANCE:${pair}`,

interval:"15",

theme:"dark",

style:"1",

locale:"en",

toolbar_bg:"#111827",

enable_publishing:false,

allow_symbol_change:true,

container_id:"tv_chart",

autosize:true

})

}

if(!window.TradingView){

const script=document.createElement("script")

script.src="https://s3.tradingview.com/tv.js"

script.onload=createChart

document.body.appendChild(script)

}else{

createChart()

}

},[pair])

return(

<div id="tv_chart" style={{height:"100%",width:"100%"}}/>

)

}
