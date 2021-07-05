import React, { Component } from "react";
import Liquidity from "./Liquidity/Liquidity";
import "./main.css";

class Main extends Component {
	render() {
		const { pools, ethLiquid } = this.props;
		return(
			<div className="main">
				<Liquidity pools={pools} ethLiquid={ethLiquid}/>
			</div>
		)
	}
}

export default Main;