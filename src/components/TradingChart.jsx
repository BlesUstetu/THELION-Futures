import { useEffect, useRef } from "react"

export default function TradingChart({pair}){

  const chartRef=useRef()

  useEffect(()=>{

    if(!window.TradingView) return

    new window.TradingView.widget({

      container_id:chartRef.current,

      symbol:"BINANCE:"+pair,

      interval:"15",

      theme:"dark",

      style:"1",

      locale:"en",

      autosize:true,

      toolbar_bg:"#0f172a",

      enable_publishing:false,

      hide_top_toolbar:false

    })

  },[pair])

  return(

    <div
      ref={chartRef}
      style={{height:"100%",width:"100%"}}
    />

  )

}
