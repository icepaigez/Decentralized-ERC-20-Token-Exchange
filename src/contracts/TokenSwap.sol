pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//todos
//create liquidity pool that has eth in the pair
//call a function to issue out LP token based on the provider's pool ownership
//create liquidity pool without eth in the pair
//estimate price of doing a trade
//perform a trade
//join a pool
//withdraw from pool

contract TokenSwap {
	string public name = "TokenSwap DEX";
	uint256 public dexLiquidity;

	IERC20 token;

	mapping (address => uint256) public liquidity;

	event PreLiquidAdded(uint256 ethBalance, uint256 tokenBalance);
	event PostLiquidAdded(address sender, uint256 ethAmount, uint256 tokenAmount, uint256 ethBalance, uint256 tokenBalance);

	constructor(address _tokenAddress) {
		token = IERC20(_tokenAddress);
	}

	// function issueLPToken() public {
	// 	//compare liquidity provided to total dex liquidity and issue 
	// 	//lptoken for that %
	// }

	function addEthLiquid(uint256 _tokenAmount) public payable {
		uint256 tokenLiquidity = token.balanceOf(address(this));
		uint256 ethLiquidity = payable(address(this)).balance;
		emit PreLiquidAdded(ethLiquidity, tokenLiquidity);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] = _tokenAmount + msg.value;
		dexLiquidity += liquidity[msg.sender];
		emit PostLiquidAdded(msg.sender, msg.value, _tokenAmount, ethLiquidity, tokenLiquidity);
	}
}



