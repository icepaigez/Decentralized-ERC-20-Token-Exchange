import React, { Component } from "react";
import "./trade.css";
import ethLogo from "../eth-logo.png";
import tokenLogo from "../token-logo.png";

class Trade extends Component {
	constructor() {
		super()
		this.state = {
			selectedPool: '',
			pairA:'ETH',
			pairB:'DApp',
			pairAValue:0,
			pairBValue:0,
			pairABalance:'',
			pairBBalance:'',
			poolBalance:'',
			tradeToken: 'DApp',
			selectedToken:'ETH',
		}
	}

	getSelectedPool = e => {
		this.setState({
			selectedPool:e.target.value
		}, () => {
			let selected = this.state.selectedPool
			selected = selected.split('-')
			this.setState({
				pairA:selected[0],
				pairB:selected[1],
				tradeToken:selected[1],
				selectedToken:selected[0]
			}, async () => {
				const { pools } = this.props;
				await this.getPoolData(pools);
			})
		})
	}

	getTradeToken = e => {
		const { pairA, pairB, tradeToken } = this.state
		let selectedToken = e.target.value
		this.setState({ selectedToken })
		if (selectedToken === pairA && tradeToken !== pairB) {
			this.setState({
				tradeToken: pairB,
			})
		} else if (selectedToken === pairB && tradeToken !== pairA) {
			this.setState({
				tradeToken: pairA,
			})
		}
	}


	getPairAValue = e => {
		this.setState({
			pairAValue: Number(e.target.value)
		})
	}

	doTrade = async e => {
		e.preventDefault()
		const { pairAValue, selectedToken, pairA, pairB } = this.state;
		const { tradeEth } = this.props
		if (pairAValue !== 0) {
			let pool = `${pairA}-${pairB}`
			if (selectedToken === 'ETH' && pool.includes('ETH')) {
				let result = await tradeEth(selectedToken, pairB, pairAValue)
				console.log(result)
			} else if (selectedToken !== 'ETH' && pool.includes('ETH')) {
				console.log('lets fuck ahead')
			} else {
				console.log('lets fuck tokens')
			}
		} else {
			alert('Please enter quantity of token to be traded')
		}
		
		this.setState({
			pairAValue:0
		})
	}

	getPoolData = async array => {
		const { dex, web3 } = this.props;
		let { pairA, pairB } = this.state;
		
		let pairABalance, pairBBalance, poolBalance;
		let pool = array.filter(pool => (pool.split('-').includes(pairA) && pool.split('-').includes(pairB)))
		if (pool.length === 1) {
			poolBalance = await dex.methods.pool(pool[0]).call();
			let oldABalance = await dex.methods.poolPair(pool[0], pairA).call();
			let oldBBalance = await dex.methods.poolPair(pool[0], pairB).call();
			let newABalance = await dex.methods.newPoolPair(pool[0], pairA).call();
			let newBBalance = await dex.methods.newPoolPair(pool[0], pairB).call();
			
			if (newABalance !== undefined && newBBalance !== undefined && oldABalance !== undefined && oldBBalance !== undefined && poolBalance !== undefined) {
				oldABalance = web3.utils.fromWei(oldABalance)
				oldBBalance = web3.utils.fromWei(oldBBalance)
				newABalance = web3.utils.fromWei(newABalance)
				newBBalance = web3.utils.fromWei(newBBalance)
				poolBalance = web3.utils.fromWei(poolBalance)
				if ((Number(newABalance) > Number(oldABalance)) && (Number(newBBalance) > Number(oldBBalance))) {
					pairABalance = newABalance;
					pairBBalance = newBBalance;
					this.setState({ pairABalance, pairBBalance, poolBalance })
				} else {
					pairABalance = oldABalance;
					pairBBalance = oldBBalance;
					this.setState({ pairABalance, pairBBalance, poolBalance })
				}
			}
		} else {
			this.setState({
				pairABalance:"0",
				pairBBalance: "0",
				poolBalance: "0"
			})
		}
	}

	async componentDidMount() {
		const { pools } = this.props;
		await this.getPoolData(pools);
	}

	async componentDidUpdate(prevProps) {
		if (this.props.pools !== prevProps.pools) {
			const { pools } = this.props;
			await this.getPoolData(pools);
		}
	}

	render() {
		const { pools } = this.props;
		const { pairA, pairB, pairAValue, pairBValue, pairABalance, pairBBalance, poolBalance, tradeToken } = this.state;
		return(
			<div className="liquidity">
				<div className="pool__summary">
					<div className="pool__data">
					  <p>Total Tokens Locked</p>
					  <div className="pool__pair">
					    <img src={pairA === 'ETH' ? ethLogo: tokenLogo} alt="" height='30'/>
					    <p>{ pairA }</p>
					    <p className="token__value">{ pools.length === 0 ? 0 : pairABalance }</p>
					  </div>
					  <div className="pool__pair">
					    <img src={pairB === 'ETH' ? ethLogo: tokenLogo} alt="" height='30'/>
					    <p>{ pairB }</p>
					    <p className="token__value">{ pools.length === 0 ? 0 : pairBBalance }</p>
					  </div>
					</div>
				</div>
				<div className="pool__liquid">
					<form className="liquidity__form" onSubmit={this.doTrade}>
					  <div className="liquid__inputs">
					    <input type="text" placeholder={pools.length === 0 ? 0 : poolBalance} name="pool" disabled/>
					    <div className="pairs">
					      <select name="pools" id="pools" onChange={this.getSelectedPool}>
					        <option value="ETH-DApp" defaultValue>ETH-DApp</option>
					        <option value="ETH-TEA">ETH-TEA</option>
					        <option value="DApp-TEA">DApp-TEA</option>
					      </select>
					    </div>
					  </div>
					  <div className="liquid__inputs">
					    <input onChange={this.getPairAValue} type="text" value={pairAValue}/>
					    <div className="tokens pairs">
					       <select name="pools" id="pools" defaultValue={pairA} onChange={this.getTradeToken}>
						      <option id="current" value={pairA}>{ pairA }</option>
						      <option value={pairB}>{ pairB }</option>
					      </select>
					    </div>
					  </div>
					  <div className="liquid__inputs">
					    <input type="text" value={pairBValue} disabled/>
					    <div className="pairs">
					       <img src={tradeToken === 'ETH' ? ethLogo : tokenLogo} height='32' alt=""/>
					       { tradeToken }
					    </div>
					  </div>
					  <button className="trader" type="submit">Trade</button>
					</form>
				</div>
			</div>
		)
	}
}

export default Trade;