pragma solidity ^0.5.0;

contract TokenSwap {
	string public name = "TokenSwap DEX";

	//2. exchange token for fiat i.e when you sell your tokens
	function transferTokenToBuyer(uint _tokenAmount) public {
		//check the type of token being swapped[erc20, ether] 
		//and ensure that they have the amount + fees

	}

	function transferEthToBuyer(uint _ethAmount) public {
		
	}

	//5. send token out of the DEX
	function sendTokens() public {

	}
}