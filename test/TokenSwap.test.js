const TokenSwap = artifacts.require("TokenSwap");
const DAppToken = artifacts.require("DAppToken");
const TeaToken = artifacts.require("TeaToken");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(qty) {
	return web3.utils.toWei(qty, "ether");
}

contract("TokenSwap", accounts => {
	let dex, token1, token2;
	before(async() => {
		token1 = await DAppToken.deployed();
		token2 = await TeaToken.deployed();
		dex = await TokenSwap.deployed(token1.address, token2.address);
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

	describe("Transfer an ETH-Token pair to the contract", async() => {
		let trf, poolName, tok1Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			poolName = `${'ETH'}-${tok1Symbol}`
			await token1.approve(dex.address, tokens("1"), {from:accounts[0]});
			trf = await dex.initEthPair(tokens("1"), poolName, 'ETH', tok1Symbol, {from:accounts[0], value:tokens("1.5")});
		})

		it('should accept a pair that contains ETH and an ERC-20 Token', async() => {
			let lpTokenBalance = await token1.balanceOf(accounts[0]);
			let lpBalance = await dex.liquidity(accounts[0]);
			let dexBalance = await dex.dexLiquidity();
			let pair = await dex.returnPairs();
			let pool = await dex.pool(poolName);
			let pair1 = await dex.poolPair(poolName, 'ETH');
			let pair2 = await dex.poolPair(poolName, tok1Symbol);


			assert.equal(lpBalance, tokens("2.5"));
			assert.equal(dexBalance.toString(), tokens("2.5"));
			assert.equal(lpTokenBalance, tokens("999999"));
			assert.equal(pair[0], poolName);
			assert.equal(pool, tokens("2.5"));
			assert.equal(pair1, tokens("1.5"));
			assert.equal(pair2, tokens("1"));
		})
	})

	describe('Update liquidity provider token portion', async() => {
		it('should update the ownership proportion of total liquidity provider token for additional liquidity', async() => {
			await dex.issueLPToken(accounts[0], tokens("100"));
			let tokenPortion = await dex.lptokenOwn(accounts[0]);
			assert.equal(tokenPortion, tokens("100"));
		})
	})

	describe("Update an existing pool with Additional Liquidity", async() => {
		let trf, tok1Symbol, poolName;
		before(async() => {
			tok1Symbol = await token1.symbol();
		  poolName = `${'ETH'}-${tok1Symbol}`
			await token1.approve(dex.address, tokens("1"), {from:accounts[0]});
			trf = await dex.addEthPair(tokens("1"), poolName, 'ETH', tok1Symbol, {from:accounts[0], value:tokens("1.5")});
		})

		it('should accept new liquidity to an existing ETH/TOKEN Liquidity Pool', async() => {
			let lpTokenBalance = await token1.balanceOf(accounts[0]);
			let lpBalance = await dex.liquidity(accounts[0]);
			let dexBalance = await dex.dexLiquidity();
			let pair = await dex.returnPairs();
			let pool = await dex.pool(poolName);
			let pair1 = await dex.poolPair(poolName, 'ETH');
			let pair2 = await dex.poolPair(poolName, tok1Symbol);

			assert.equal(lpBalance.toString(), tokens("5"));
			assert.equal(dexBalance.toString(), tokens("5"));
			assert.equal(lpTokenBalance, tokens("999998"));
			assert.equal(pair.length, 1);
			assert.equal(pool, tokens("5"));
			assert.equal(pair1, tokens("3"));
			assert.equal(pair2, tokens("2"));
		})
	})

	describe("Transfer a Token-Token pair to the contract", async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`
			await token1.approve(dex.address, tokens("1"), {from:accounts[0]});
			await token2.approve(dex.address, tokens("1.2"), {from:accounts[0]});
			await dex.initTokenPair(tokens("1"), tokens("1.2"), poolName, tok1Symbol, tok2Symbol, {from:accounts[0]});
		})

		it('should accept a pair that contains 2 ERC-20 Tokens', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pair = await dex.returnPairs();
			let pool = await dex.pool(poolName);
			let pair1 = await dex.poolPair(poolName, tok1Symbol);
			let pair2 = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens("7.2"));
			assert.equal(pair[1], poolName);
			assert.equal(pair.length, 2);
			assert.equal(pool.toString(), tokens("2.2"));
			assert.equal(pair1, tokens("1"));
			assert.equal(pair2, tokens("1.2"));
		})
	})

	describe("Transfer additional liquidity to an existing Token-Token pair pool", async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`
			await token1.approve(dex.address, tokens("2"), {from:accounts[0]});
			await token2.approve(dex.address, tokens("3"), {from:accounts[0]});
			await dex.addTokenPair(tokens("2"), tokens("3"), poolName, tok1Symbol, tok2Symbol, {from:accounts[0]});
		})

		it('should accept new liquidity to an existing Token-Token pool', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pair = await dex.returnPairs();
			let pool = await dex.pool(poolName);
			let pair1 = await dex.poolPair(poolName, tok1Symbol);
			let pair2 = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens("12.2"));
			assert.equal(pair[1], poolName);
			assert.equal(pair.length, 2);
			assert.equal(pool.toString(), tokens("7.2"));
			assert.equal(pair1, tokens("3"));
			assert.equal(pair2, tokens("4.2"));
		})
	})
})  