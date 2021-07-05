import React, { Component } from "react";
import "./liquidity.css";

class Liquidity extends Component {
	render() {
		return(
			<div className="liquidity">
				<div className="pool__summary">
					<div className="pool__data">
					  <p>Total Tokens Locked</p>
					  <div className="pool__pair">
					    <img src=""/>
					    <p>USDC</p>
					    <p className="token__value">100000</p>
					  </div>
					  <div className="pool__pair">
					    <img src=""/>
					    <p>ETH</p>
					    <p className="token__value">1000</p>
					  </div>
					</div>
				</div>
				<div className="pool__liquid">
					<form>
					  <div>
					    <input type="text" placeholder="0" name="pool" disabled/>
					    <div>
					      <select name="pools" id="pools">
					        <option value="eth__dapp" selected>ETH-DApp</option>
					        <option value="eth__tea">ETH-TEA</option>
					        <option value="dapp__tea">DApp-TEA</option>
					      </select>
					    </div>
					  </div>
					  <div>
					    <input type="text" name="" placeholder="0"/>
					    <div>
					       <img src="" height='32' alt=""/>
					       &nbsp;&nbsp;&nbsp; ETH
					    </div>
					  </div>
					  <div>
					    <input type="text" name="" placeholder="0"/>
					    <div>
					       <img src="" height='32' alt=""/>
					       &nbsp;&nbsp;&nbsp; DApp
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