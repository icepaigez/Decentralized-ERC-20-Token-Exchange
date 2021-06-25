const TokenSwap = artifacts.require("TokenSwap");
const DAppToken = artifacts.require("DAppToken");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(qty) {
	return web3.utils.toWei(qty, "ether");
}

contract("TokenSwap", accounts => {
	let dex, token1;
	before(async() => {
		token1 = await DAppToken.deployed()
		dex = await TokenSwap.deployed(token1.address);
	})

	describe('TokenSwap DEX', async() => {
		it('should have an exchange name', async() => {
			let dexName = await dex.name();
			assert.equal(dexName, "TokenSwap DEX")
		})
	})

	describe('DAppToken', async() => {
		it('should have an ERC-20 token name', async() => {
			let tok1Name = await token1.name();
			assert.equal(tok1Name, "DAppToken")
		})
	})

	describe('DAppToken Owner', async() => {
		it('Account[0] should hold 1m DApp tokens', async() => {
			let balance = await token1.balanceOf(accounts[0]);
			assert.equal(balance.toString(), tokens("1000000"))
		})
	})

	describe("Transfer ETH/TOKEN pair to the contract", async() => {
		let trf, poolName;
		before(async() => {
			let tok1Symbol = await token1.symbol();
			poolName = `${tok1Symbol}-${'ETH'}`
			await token1.approve(dex.address, tokens("1"), {from:accounts[0]});
			trf = await dex.initEthPair(tokens("1"), poolName, {from:accounts[0], value:tokens("1.5")});
		})

		it('should accept a pair that contains ETH and an ERC-20 Token', async() => {
			let lpTokenBalance = await token1.balanceOf(accounts[0]);
			let dexEthBalance = await web3.eth.getBalance(dex.address);
			let dexTokenBalance = await token1.balanceOf(dex.address);
			let lpBalance = await dex.liquidity(accounts[0]);
			let dexBalance = await dex.dexLiquidity();
			let pair = await dex.returnPairs();

			assert.equal(lpBalance, tokens("2.5"));
			assert.equal(dexBalance.toString(), tokens("2.5"));
			assert.equal(lpTokenBalance, tokens("999999"));
			assert.equal(dexEthBalance, tokens("1.5"));
			assert.equal(dexTokenBalance, tokens("1"));
			assert.equal(pair[0], poolName);
		})
	})

	describe('Update liquidity provider token portion', async() => {
		it('should update the ownership proportion of total liquidity provider token for additional liquidity', async() => {
			await dex.issueLPToken(accounts[0], tokens("100"));
			let tokenPortion = await dex.lptokenOwn(accounts[0]);
			assert.equal(tokenPortion, tokens("100"));
		})
	})
})  