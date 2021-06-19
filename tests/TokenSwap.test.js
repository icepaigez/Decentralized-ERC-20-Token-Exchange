const TokenSwap = artifacts.require("TokenSwap");


function tokens(qty) {
	return web3.utils.toWei(qty, "ether");
}

contract("TokenSwap", accounts => {
	let contract;
	before(async() => {
		contract = await TokenSwap.deployed();
	})
}) 