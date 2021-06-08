pragma solidity ^0.5.0;

contract TokenSwap {
	string public name = "TokenSwap DEX";

	address owner;

	event Sent(address from, address to, uint amount);

	constructor() public {
		owner = msg.sender;
	}

	//2. transfer ether or token to another account from one account
	function transferEthToBuyer(address _buyer) public payable {
		require(owner.balance >= msg.value);
		address payable _receiver = address(uint160(_buyer));
		_receiver.transfer(msg.value);
		emit Sent(owner, _buyer, msg.value);
	}
}