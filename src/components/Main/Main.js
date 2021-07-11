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
		const { pools, ethLiquid, dex, web3, tokenLiquid, tradeEth, tradeTokenForEth, user, dapp, tea, tradeTokens } = this.props;
		const { view } = this.state;
		return(
			<div className="main">
				<div className="option">
					<button onClick={this.changeView} value="liquid" className="liquid">Liquidity</button>
					<button onClick={this.changeView} value="trade" className="trade">Trade</button>
				</div>
				{ view === 'liquid' ? <Liquidity user={user} dapp={dapp} tea={tea} tokenLiquid={tokenLiquid} web3={web3} dex={dex} pools={pools} ethLiquid={ethLiquid}/> : <Trade user={user} dapp={dapp} tea={tea} tradeTokenForEth={tradeTokenForEth} tradeEth={tradeEth} tradeTokens={tradeTokens} web3={web3} dex={dex} pools={pools}/> }
			</div>
		)
	}
}

export default Main;