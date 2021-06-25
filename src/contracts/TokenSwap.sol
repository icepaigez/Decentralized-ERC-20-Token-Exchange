pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//todos
//function to issue out LP token based on the provider's pool ownership - in progress
//create liquidity pool without eth in the pair
//estimate price of doing a trade
//perform a trade
//join a pool
//withdraw from pool

contract TokenSwap {
	string public name = "TokenSwap DEX";
	uint256 public dexLiquidity;

	IERC20 token;
	IERC20 token2;
	IERC20 lptoken;

	string[] public pairs;
	mapping (address => uint256) public liquidity;
	mapping (address => uint256) public lptokenOwn;

	constructor(address _tokenAddress, address _lptokenAddress, address _token2Address) {
		token = IERC20(_tokenAddress);
		lptoken = IERC20(_lptokenAddress);
		token2 = IERC20(_token2Address);
	}

	function returnPairs() public view returns(string[] memory) {
		return pairs;
	}

	function issueLPToken(address _provider, uint256 _lptAmount) public {
		lptokenOwn[_provider] = _lptAmount;
	}

	function initEthPair(uint256 _tokenAmount, string memory _pairName) public payable {
		require(_tokenAmount > 0);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] += _tokenAmount + msg.value;
		dexLiquidity += liquidity[msg.sender];
		pairs.push(_pairName);
	}

	function addEthPair(uint256 _tokenAmount) public payable {
		require(_tokenAmount > 0);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] += _tokenAmount + msg.value;
		dexLiquidity += _tokenAmount + msg.value;
	}
}




