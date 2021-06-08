const TokenSwap = artifacts.require("TokenSwap");

contract("TokenSwap", accounts => {
	let contract;
	before(async() => {
		contract = await TokenSwap.deployed();
	})
})