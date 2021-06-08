pragma solidity ^0.5.0;

contract TokenSwap {
	string public name = "TokenSwap DEX";

	event Sent(address from, address to, uint amount);

	//2. transfer ether or token to another account from one account
	function transferEthToBuyer(uint _ethAmount, address _buyer) public {
		require(balances[msg.sender] >= _ethAmount);
		balances[msg.sender] -= _ethAmount;
		balances[_buyer] += _ethAmount;
		emit Sent(msg.sender, _buyer, _ethAmount);
	}

}