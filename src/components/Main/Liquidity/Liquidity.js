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
		const { ethLiquid, tokenLiquid } = this.props
		if (pairAValue !== 0 && pairBValue !== 0) {
			if (pairA === 'ETH') {
				try {
					let result = await ethLiquid(pairBValue, pairAValue, pairA, pairB)
					console.log(result)
					if (result && result.status) {
						window.location.reload();
					}
				} catch(err) {
					console.error("Error occurred when providing an ETH-Token Liquidity", err);
				}
			} else {
				try {
					let result = await tokenLiquid(pairAValue, pairBValue, pairA, pairB)
					console.log(result)
					if (result && result.status) {
						window.location.reload();
					}
				} catch(err) {
					console.error("Error occurred when providing an Token-Token Liquidity", err)
				}
			}
			//clear the form
			this.setState({
				pairAValue:0,
				pairBValue:0
			})
		} else {
			alert('Please enter values for both fields')
			//clear the form
			this.setState({
				pairAValue:0,
				pairBValue:0
			})
		}
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
		const { pairA, pairB, pairAValue, pairBValue, pairABalance, pairBBalance, poolBalance } = this.state;
		console.log(pools)
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