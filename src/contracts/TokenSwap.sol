pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

//todos
//function to issue out LP token based on the provider's pool ownership 
//create liquidity pool without eth in the pair
//estimate price of doing a trade
//perform a trade
//join a pool
//withdraw from pool

contract TokenSwap {

	using SafeMath for uint256;

	string public name = "TokenSwap DEX";
	uint256 public dexLiquidity;

	IERC20 token;
	IERC20 token2;
	IERC20 lptoken;

	string[] public pairs;
	mapping (address => uint256) public liquidity;
	mapping (address => mapping (string => uint256)) public totalLiquidity;
	mapping (address => mapping (string => mapping (string => uint256))) public poolLiquidity;
	mapping (address => mapping (string => uint256)) public lptokenOwned;
	mapping (string => uint256) public pool; //ETH-DApp: "500"
	mapping (string => mapping (string => uint256)) public poolPair; //ETH-DApp[ETH]:100, ETH-DApp[DApp]:400 

	constructor(address _tokenAddress, address _lptokenAddress, address _token2Address) {
		token = IERC20(_tokenAddress);
		lptoken = IERC20(_lptokenAddress);
		token2 = IERC20(_token2Address);
	}

	function returnPairs() public view returns(string[] memory) {
		return pairs;
	}

	function issueLPToken(address _provider, uint256 _lptAmount, string memory _pairName) public {
		lptokenOwned[_provider][_pairName] = _lptAmount;
	}

	function initEthPair(uint256 _tokenAmount, string memory _pairName, string memory _pair1, string memory _pair2) public payable {
		require(_tokenAmount > 0);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] += _tokenAmount + msg.value;
		dexLiquidity += _tokenAmount + msg.value;
		pool[_pairName] += _tokenAmount + msg.value;
		totalLiquidity[msg.sender][_pairName] += _tokenAmount + msg.value;
		poolLiquidity[msg.sender][_pairName][_pair1] += msg.value;
		poolLiquidity[msg.sender][_pairName][_pair2] += _tokenAmount;
		poolPair[_pairName][_pair1] += msg.value;
		poolPair[_pairName][_pair2] += _tokenAmount;
		pairs.push(_pairName);
	}

	function addEthPair(uint256 _tokenAmount, string memory _pairName, string memory _pair1, string memory _pair2) public payable {
		require(_tokenAmount > 0);
		token.transferFrom(msg.sender, address(this), _tokenAmount);
		liquidity[msg.sender] += _tokenAmount + msg.value;
		dexLiquidity += _tokenAmount + msg.value;
		pool[_pairName] += _tokenAmount + msg.value;
		totalLiquidity[msg.sender][_pairName] += _tokenAmount + msg.value;
		poolLiquidity[msg.sender][_pairName][_pair1] += msg.value;
		poolLiquidity[msg.sender][_pairName][_pair2] += _tokenAmount;
		poolPair[_pairName][_pair1] += msg.value;
		poolPair[_pairName][_pair2] += _tokenAmount;
	}

	function initTokenPair(uint256 _token1Amount, uint256 _token2Amount, string memory _pairName, string memory _pair1, string memory _pair2) public {
		require(_token1Amount > 0 && _token2Amount > 0);
		token.transferFrom(msg.sender, address(this), _token1Amount);
		token2.transferFrom(msg.sender, address(this), _token2Amount);
		liquidity[msg.sender] += _token1Amount + _token2Amount;
		dexLiquidity += _token1Amount + _token2Amount;
		pool[_pairName] += _token1Amount + _token2Amount;
		totalLiquidity[msg.sender][_pairName] += _token1Amount + _token2Amount;
		poolLiquidity[msg.sender][_pairName][_pair1] += _token1Amount;
		poolLiquidity[msg.sender][_pairName][_pair2] += _token2Amount;
		poolPair[_pairName][_pair1] += _token1Amount;
		poolPair[_pairName][_pair2] += _token2Amount;
		pairs.push(_pairName);
	}

	function addTokenPair(uint256 _token1Amount, uint256 _token2Amount, string memory _pairName, string memory _pair1, string memory _pair2) public {
		require(_token1Amount > 0 && _token2Amount > 0);
		token.transferFrom(msg.sender, address(this), _token1Amount);
		token2.transferFrom(msg.sender, address(this), _token2Amount);
		liquidity[msg.sender] += _token1Amount + _token2Amount;
		dexLiquidity += _token1Amount + _token2Amount;
		pool[_pairName] += _token1Amount + _token2Amount;
		totalLiquidity[msg.sender][_pairName] += _token1Amount + _token2Amount;
		poolLiquidity[msg.sender][_pairName][_pair1] += _token1Amount;
		poolLiquidity[msg.sender][_pairName][_pair2] += _token2Amount;
		poolPair[_pairName][_pair1] += _token1Amount;
		poolPair[_pairName][_pair2] += _token2Amount;
	}

	function tradeEthforToken(string memory _pairName, string memory _pair1, string memory _pair2) public payable returns(uint256) {
		uint256 pair1Balance = poolPair[_pairName][_pair1];
		uint256 pair2Balance = poolPair[_pairName][_pair2];
		uint256 inputAmount = msg.value;
		require(pair1Balance > msg.value && pair2Balance > 0);
		uint256 poolConstant = pair1Balance * pair2Balance;
		uint256 inputAmountWithFee = inputAmount.mul(997);
		uint256 postTradePair2Balance = poolConstant.mul(1000) / (inputAmountWithFee.add(pair1Balance.mul(1000)));
		uint256 tokenTradeValue = pair2Balance.sub(postTradePair2Balance);
		require(pair2Balance > tokenTradeValue);
		token.transfer(msg.sender, tokenTradeValue);
		poolPair[_pairName][_pair1] += inputAmount;
		poolPair[_pairName][_pair2] -= tokenTradeValue;
		uint256 poolBal = pool[_pairName];
		poolBal = poolBal.add(inputAmount).sub(tokenTradeValue);
		pool[_pairName] = poolBal;
		dexLiquidity = dexLiquidity.add(inputAmount).sub(tokenTradeValue);
		return tokenTradeValue;
	}

	function tradeTokenforEth(uint256 _tokenAmount, string memory _pairName, string memory _pair1, string memory _pair2) public returns(uint256) {
		uint256 pair1Balance = poolPair[_pairName][_pair1];
		uint256 pair2Balance = poolPair[_pairName][_pair2];
		uint256 inputAmount = _tokenAmount;
		require(pair1Balance > 0 && pair2Balance > inputAmount);
		uint256 poolConstant = pair1Balance * pair2Balance;
		uint256 postTradePair1Balance = poolConstant.mul(1000) / (pair2Balance.mul(1000).add(inputAmount.mul(997)));
		uint256 etherTradeValue = pair1Balance.sub(postTradePair1Balance);
		require(pair1Balance > etherTradeValue);
		address payable trader = payable(msg.sender);
		token.transferFrom(msg.sender, address(this), inputAmount);
		trader.transfer(etherTradeValue);
		poolPair[_pairName][_pair1] -= etherTradeValue;
		poolPair[_pairName][_pair2] += inputAmount;
		uint256 poolBal = pool[_pairName];
		poolBal = poolBal.add(inputAmount).sub(etherTradeValue);
		pool[_pairName] = poolBal;
		dexLiquidity = dexLiquidity.add(inputAmount).sub(etherTradeValue);
		return etherTradeValue;
	}

	function tradeTokenforToken(uint256 _tokenAmount, string memory _tradeToken, string memory _pairName, string memory _pair1, string memory _pair2) public returns(uint256) {
		uint256 pair1Balance = poolPair[_pairName][_pair1];
		uint256 pair2Balance = poolPair[_pairName][_pair2];
		uint256 inputAmount = _tokenAmount;
		uint256 tokenTradeValue;
		require(pair1Balance > 0 && pair2Balance > 0);
		uint256 poolConstant = pair1Balance * pair2Balance;
		uint256 inputAmountWithFee = inputAmount.mul(997);
		uint256 numerator = poolConstant.mul(1000);
		if (keccak256(abi.encodePacked(_tradeToken)) == keccak256(abi.encodePacked(_pair1))) {
			uint256 denominator = pair1Balance.mul(1000).add(inputAmountWithFee);
			uint256 postTradePairBalance = numerator / denominator;
			tokenTradeValue = pair2Balance.sub(postTradePairBalance);
			require(pair2Balance > tokenTradeValue);
			token.transferFrom(msg.sender, address(this), inputAmount);//assumed that pair1 is token
			token2.transfer(msg.sender, tokenTradeValue);
			poolPair[_pairName][_pair1] += inputAmount;
			poolPair[_pairName][_pair2] -= tokenTradeValue;
			uint256 poolBal = pool[_pairName];
			poolBal = poolBal.add(inputAmount).sub(tokenTradeValue);
			dexLiquidity = dexLiquidity.add(inputAmount).sub(tokenTradeValue);
		} else {
			uint256 denominator = pair2Balance.mul(1000).add(inputAmountWithFee);
			uint256 postTradePairBalance = numerator / denominator;
			tokenTradeValue = pair1Balance.sub(postTradePairBalance);
			require(pair1Balance > tokenTradeValue);
			token2.transferFrom(msg.sender, address(this), inputAmount);//assumed that pair2 is token2
			token.transfer(msg.sender, tokenTradeValue);
			poolPair[_pairName][_pair1] -= tokenTradeValue;
			poolPair[_pairName][_pair2] += inputAmount;
			uint256 poolBal = pool[_pairName];
			poolBal = poolBal.add(inputAmount).sub(tokenTradeValue);
			dexLiquidity = dexLiquidity.add(inputAmount).sub(tokenTradeValue);
		}
		return tokenTradeValue;
	}
	
}




