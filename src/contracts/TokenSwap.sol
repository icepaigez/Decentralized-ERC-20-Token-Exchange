pragma solidity ^0.5.0;

contract TokenSwap {
	string public name = "TokenSwap DEX";

	address owner;

	event Sent(address from, address to, uint amount);

	constructor() {
		owner = msg.sender;
	}

	//2. transfer ether or token to another account from one account
	function transferEthToBuyer(uint _ethAmount, address _buyer) public payable {
		require(owner.balance >= _ethAmount);
		_buyer.transfer(_ethAmount);
		emit Sent(msg.sender, _buyer, _ethAmount);
	}
}