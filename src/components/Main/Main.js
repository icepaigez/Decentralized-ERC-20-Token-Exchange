import React, { Component } from "react";
import Liquidity from "./Liquidity/Liquidity";
import "./main.css";

class Main extends Component {
	render() {
		return(
			<div className="main">
				<Liquidity />
			</div>
		)
	}
}

export default Main;