import React, { Component } from "react";
import Liquidity from "./Liquidity/Liquidity";
import "./main.css";

class Main extends Component {
	render() {
		const { pools, ethLiquid, dex, web3, tokenLiquid } = this.props;
		return(
			<div className="main">
				<Liquidity tokenLiquid={tokenLiquid} web3={web3} dex={dex} pools={pools} ethLiquid={ethLiquid}/>
			</div>
		)
	}
}

export default Main;