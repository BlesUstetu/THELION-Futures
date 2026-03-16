import StableChart from "./components/StableChart"
import OrderPanel from "./components/OrderPanel"
import BottomTabs from "./components/BottomTabs"

export default function App(){

const pair="BTCUSDT"

return(

<div className="app">

<div className="top">

<div className="chart">
<StableChart/>
</div>

<OrderPanel/>

</div>

<BottomTabs/>

</div>

)

}
