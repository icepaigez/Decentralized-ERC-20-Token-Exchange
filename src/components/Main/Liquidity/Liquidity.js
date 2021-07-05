import React, { Component } from "react";
import "./liquidity.css";
import ethLogo from "../eth-logo.png";
import tokenLogo from "../token-logo.png";

class Liquidity extends Component {
	render() {
		return(
			<div className="liquidity">
				<div className="pool__summary">
					<div className="pool__data">
					  <p>Total Tokens Locked</p>
					  <div className="pool__pair">
					    <img src={tokenLogo} alt="" height='30'/>
					    <p>USDC</p>
					    <p className="token__value">100000</p>
					  </div>
					  <div className="pool__pair">
					    <img src={ethLogo} alt="" height='30'/>
					    <p>ETH</p>
					    <p className="token__value">1000</p>
					  </div>
					</div>
				</div>
				<div className="pool__liquid">
					<form className="liquidity__form">
					  <div>
					    <input type="text" placeholder="0" name="pool" disabled/>
					    <div className="pairs">
					      <select name="pools" id="pools">
					        <option value="eth__dapp" defaultValue>ETH-DApp</option>
					        <option value="eth__tea">ETH-TEA</option>
					        <option value="dapp__tea">DApp-TEA</option>
					      </select>
					    </div>
					  </div>
					  <div>
					    <input type="text" name="" placeholder="0"/>
					    <div className="pairs">
					       <img src={ethLogo} height='32' alt=""/>
					        ETH
					    </div>
					  </div>
					  <div>
					    <input type="text" name="" placeholder="0"/>
					    <div className="pairs">
					       <img src={tokenLogo} height='32' alt=""/>
					       DApp
					    </div>
					  </div>
					  <button type="submit">Provide Liquidity</button>
					</form>
				</div>
			</div>
		)
	}
}

export default Liquidity;