pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenSwap {

	string public name = "TokenSwap DEX";

	event Sent(address from, address to, uint amount);

	//1. transfer ether  to another account from one account
	function transferEthToBuyer(address _buyer) public payable {
		require(msg.sender.balance >= msg.value);
		payable(_buyer).transfer(msg.value);
		emit Sent(msg.sender, _buyer, msg.value);
	}

}

