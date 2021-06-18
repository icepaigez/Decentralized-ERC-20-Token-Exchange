pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//todos
//create liquidity pool that has eth in the pair
//create liquidity pool without eth in the pair
//estimate price of doing a trade
//perform a trade
//join a pool
//withdraw from pool

contract TokenSwap {
	string public name = "TokenSwap DEX";
	uint public tradeFee = 0.003; 

	IERC20 token;

	mapping (address => uint) public liquidity;

	event PreLiquidAdded(uint ethBalance, uint tokenBalance);
	event PostLiquidAdded(address sender, uint ethAmount, uint tokenAmount, uint ethBalance, uint tokenBalance);

	constructor(address _tokenAddress) public {
		token = IERC20(_tokenAddress);
	}

	function addEthLiquid(uint _tokenAmount) public payable {
		require(token.balanceOf(msg.sender) >= _tokenAmount);
		require(msg.value == _tokenAmount);
		uint tokenLiquidity = token.balanceOf(address(this));
		uint ethLiquidity = address(this).balance;
		emit PreLiquidAdded(ethLiquidity, tokenLiquidity);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] = _tokenAmount;
		emit PostLiquidAdded(msg.sender, msg.value, _tokenAmount, ethLiquidity, tokenLiquidity);
	}
}


