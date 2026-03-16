import StableChart from "./components/StableChart"
import OrderPanel from "./components/OrderPanel"
import BottomTabs from "./components/BottomTabs"
import { TradingProvider } from "./store/tradingStore"

export default function App(){

return(

<TradingProvider>

<div className="app">

<div className="top">

<div className="chart">
<StableChart/>
</div>

<OrderPanel/>

</div>

<BottomTabs/>

</div>

</TradingProvider>

)

}
