import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles.css"

import { TradingProvider } from "./store/tradingStore"

ReactDOM.createRoot(document.getElementById("root")).render(

<TradingProvider>

<App/>

</TradingProvider>

)
