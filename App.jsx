import TradingChart from "./components/TradingChart"
import OrderPanel from "./components/OrderPanel"
import BottomTabs from "./components/BottomTabs"

export default function App(){

return(

<div className="terminal">

<div className="chart">
<TradingChart pair="BTCUSDT"/>
</div>

<div className="order">
<OrderPanel/>
</div>

<div className="bottom">
<BottomTabs/>
</div>

</div>

)

}
