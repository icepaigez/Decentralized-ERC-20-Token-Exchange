pragma solidity ^0.8.4;

contract TokenSwap {
	string public name = "TokenSwap DEX";

	event Sent(address from, address to, uint amount);

	//2. transfer ether  to another account from one account
	function transferEthToBuyer(address _buyer, uint _amount) public {
		require(msg.sender.balance >= _amount);
		payable(_buyer).transfer(_amount);
		emit Sent(msg.sender, _buyer, _amount);
	}
}