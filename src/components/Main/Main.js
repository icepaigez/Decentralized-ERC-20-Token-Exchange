import React, { Component } from "react";
import Liquidity from "./Liquidity/Liquidity";
import Trade from "./Trade/Trade";
import "./main.css";

class Main extends Component {

	constructor() {
		super()
		this.state = {
			view: 'liquid'
		}
	}

	changeView = e => {
		this.setState({
			view: e.target.value
		})
	}

	render() {
		const { pools, ethLiquid, dex, web3, tokenLiquid } = this.props;
		const { view } = this.state;
		return(
			<div className="main">
				<div className="option">
					<button onClick={this.changeView} value="liquid" className="liquid">Liquidity</button>
					<button onClick={this.changeView} value="trade" className="trade">Trade</button>
				</div>
				{ view === 'trade' ? <Liquidity tokenLiquid={tokenLiquid} web3={web3} dex={dex} pools={pools} ethLiquid={ethLiquid}/> : <Trade web3={web3} dex={dex} pools={pools}/> }
			</div>
		)
	}
}

export default Main;