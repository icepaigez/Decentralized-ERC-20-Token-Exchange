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
	IERC20 lptoken;

	address[] public liquidityProviders;
	mapping (address => uint256) public liquidity;
	mapping (address => uint256) public lptokenOwn;

	event LiquidAdded(address sender, uint256 liquidAmount, uint256 dexAmount);

	constructor(address _tokenAddress, address _lptokenAddress) {
		token = IERC20(_tokenAddress);
		lptoken = IERC20(_lptokenAddress);
	}

	function issueLPToken(address _provider, uint256 _lptAmount) public {
		lptokenOwn[_provider] = _lptAmount;
	}

	function addEthLiquid(uint256 _tokenAmount) public payable {
		require(_tokenAmount > 0);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] += _tokenAmount + msg.value;
		dexLiquidity += liquidity[msg.sender];
		liquidityProviders.push(msg.sender);
		emit LiquidAdded(msg.sender, liquidity[msg.sender], dexLiquidity);
	}
}



