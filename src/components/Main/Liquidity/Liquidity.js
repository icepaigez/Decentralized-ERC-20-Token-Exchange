import React, { Component } from "react";
import "./liquidity.css";
import ethLogo from "../eth-logo.png";
import tokenLogo from "../token-logo.png";

class Liquidity extends Component {
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
			poolBalance:''
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
				pairB:selected[1]
			}, async () => {
				const { pools } = this.props;
				await this.getPoolData(pools);
			})
		})
	}

	getPairAValue = e => {
		this.setState({
			pairAValue: Number(e.target.value)
		})
	}

	getPairBValue = e => {
		this.setState({
			pairBValue: Number(e.target.value)
		})
	}

	acceptLiquidity = async e => {
		e.preventDefault()
		const { pairAValue, pairBValue, pairA, pairB } = this.state;
		if (pairAValue !== 0 && pairBValue !== 0) {
			if (pairA === 'ETH') {
				try {
					const { ethLiquid } = this.props
					let result = await ethLiquid(pairBValue, pairAValue, pairA, pairB)
					if (result.status) {
						window.location.reload();
					}
				} catch(err) {
					console.error("Error occurred when providing an ETH-Token Liquidity", err)
				}
			}
			this.setState({
				pairAValue:0,
				pairBValue:0
			})
		} else {
			alert('Please enter values for both fields')
		}
	}

	getPoolData = async array => {
		const { dex, web3 } = this.props;
		let { pairA, pairB } = this.state;
		
		let pairABalance, pairBBalance, poolBalance;
		let pool = array.filter(pool => pool.split('-').includes(pairA && pairB))
		if (pool.length === 1) {
			poolBalance = await dex.methods.pool(pool[0]).call();
			pairABalance = await dex.methods.poolPair(pool[0], pairA).call();
			pairBBalance = await dex.methods.poolPair(pool[0], pairB).call();
			if (pairABalance !== undefined && pairBBalance !== undefined && poolBalance !== undefined) {
				pairABalance = web3.utils.fromWei(pairABalance)
				pairBBalance = web3.utils.fromWei(pairBBalance)
				poolBalance = web3.utils.fromWei(poolBalance)
			}
			this.setState({ pairABalance, pairBBalance, poolBalance })
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
		const { pairA, pairB, pairAValue, pairBValue, pairABalance, pairBBalance, poolBalance } = this.state;
		
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
					<form className="liquidity__form" onSubmit={this.acceptLiquidity}>
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
					    <div className="pairs">
					       <img src={pairA === 'ETH' ? ethLogo : tokenLogo} height='32' alt=""/>
					        { pairA }
					    </div>
					  </div>
					  <div className="liquid__inputs">
					    <input onChange={this.getPairBValue} type="text" value={pairBValue}/>
					    <div className="pairs">
					       <img src={pairB === 'ETH' ? ethLogo : tokenLogo} height='32' alt=""/>
					       { pairB }
					    </div>
					  </div>
					  <button type="submit">Provide liquidity</button>
					</form>
				</div>
			</div>
		)
	}
}

export default Liquidity;