pragma solidity ^0.5.0;

contract TokenSwap {
	string public name = "TokenSwap DEX";

	address owner;

	event Sent(address from, address to, uint amount);

	constructor() public {
		owner = msg.sender;
	}

	//2. transfer ether or token to another account from one account
	function transferEthToBuyer(uint _ethAmount, address _buyer) public {
		require(owner.balance >= _ethAmount);
		address payable _receiver = address(uint160(_buyer));
		_receiver.transfer(_ethAmount);
		emit Sent(msg.sender, _buyer, _ethAmount);
	}
}