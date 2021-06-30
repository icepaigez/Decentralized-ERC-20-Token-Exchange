const TokenSwap = artifacts.require("TokenSwap");
const DAppToken = artifacts.require("DAppToken");
const TeaToken = artifacts.require("TeaToken");

function tokens(qty) {
	return web3.utils.toWei(qty, "ether");
}

contract("TokenSwap", accounts => {
	let token1, token2, dex;
	before(async() => {
		token1 = await DAppToken.deployed();
		token2 = await TeaToken.deployed();
		dex = await TokenSwap.deployed(token1.address, token2.address);
	})

	describe('Exchange Deployment', async() => {
		it('should have an exchange name and deployed tokens', async() => {
			let dexName = await dex.name();
			assert.equal(dexName, "TokenSwap DEX");
		})
	})

	describe('Provide Initial ETH-Token Liquidity', async() => {
		let poolName, tok1Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			poolName = `${'ETH'}-${tok1Symbol}`;
			await token1.approve(dex.address, tokens("1000"), {from:accounts[0]});
			await dex.initEthPair(tokens("1000"), poolName, 'ETH', tok1Symbol, {from:accounts[0], value:tokens("50")});
		})

		it('should accept an Initial pair that contains ETH and an ERC-20 Token', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, 'ETH');
			let pair2Liquidity = await dex.poolPair(poolName, tok1Symbol);

			assert.equal(dexBalance.toString(), tokens('1050'));
			assert.equal(pairs.length, 1);
			assert.equal(pairs[0], poolName);
			assert.equal(providerBalance.toString(), tokens('1050'));
			assert.equal(providerPoolBalance.toString(), tokens('1050'));
			assert.equal(poolLiquidity.toString(), tokens('1050'));
			assert.equal(pair1Liquidity.toString(), tokens('50'));
			assert.equal(pair2Liquidity.toString(), tokens('1000'));
		})
	})

	describe('Provide additional liquidity to ETH-Token pool', async() => {
		let poolName, tok1Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			poolName = `${'ETH'}-${tok1Symbol}`;
			await token1.approve(dex.address, tokens("500"), {from:accounts[0]});
			await dex.addEthPair(tokens("500"), poolName, 'ETH', tok1Symbol, {from:accounts[0], value:tokens("100")});
		})

		it('should accept new liquidity to an existing ETH-Token pool', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, 'ETH');
			let pair2Liquidity = await dex.poolPair(poolName, tok1Symbol);

			assert.equal(dexBalance.toString(), tokens('1650'));
			assert.equal(pairs.length, 1);
			assert.equal(pairs[0], poolName);
			assert.equal(providerBalance.toString(), tokens('1650'));
			assert.equal(providerPoolBalance.toString(), tokens('1650'));
			assert.equal(poolLiquidity.toString(), tokens('1650'));
			assert.equal(pair1Liquidity.toString(), tokens('150'));
			assert.equal(pair2Liquidity.toString(), tokens('1500'));
		})
	})

	describe('Provide Initial Token-Token Liquidity', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.approve(dex.address, tokens("1000"), {from:accounts[0]});
			await token2.approve(dex.address, tokens("1000"), {from:accounts[0]});
			await dex.initTokenPair(tokens("1000"), tokens("1000"), poolName, tok1Symbol, tok2Symbol, {from:accounts[0]});
		})

		it('should accept an Initial pair that contains ETH and an ERC-20 Token', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let pair2Liquidity = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('3650'));
			assert.equal(pairs.length, 2);
			assert.equal(pairs[1], poolName);
			assert.equal(providerBalance.toString(), tokens('3650'));
			assert.equal(providerPoolBalance.toString(), tokens('2000'));
			assert.equal(poolLiquidity.toString(), tokens('2000'));
			assert.equal(pair1Liquidity.toString(), tokens('1000'));
			assert.equal(pair2Liquidity.toString(), tokens('1000'));
		})
	})

	describe('Provide additional liquidity to Token-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.approve(dex.address, tokens("500"), {from:accounts[0]});
			await token2.approve(dex.address, tokens("500"), {from:accounts[0]});
			await dex.addTokenPair(tokens("500"), tokens("500"), poolName, tok1Symbol, tok2Symbol, {from:accounts[0]});
		})

		it('should accept new liquidity to an existing Token-Token pool', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let pair2Liquidity = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('4650'));
			assert.equal(pairs.length, 2);
			assert.equal(pairs[1], poolName);
			assert.equal(providerBalance.toString(), tokens('4650'));
			assert.equal(providerPoolBalance.toString(), tokens('3000'));
			assert.equal(poolLiquidity.toString(), tokens('3000'));
			assert.equal(pair1Liquidity.toString(), tokens('1500'));
			assert.equal(pair2Liquidity.toString(), tokens('1500'));
		})
	})

	describe('Trade ether for a token from an ETH-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = 'ETH';
			tok2Symbol = await token1.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			//await token1.transfer(accounts[1], tokens('10000'),{from:accounts[0]});//
			//await token1.approve(dex.address, tokens("500"), {from:accounts[1]});
			await dex.tradeEthforToken(poolName, tok1Symbol, tok2Symbol, {from:accounts[1], value:web3.utils.toWei('50')});
		})

		it('should accept ether from the trader and exchange it for a token after deducting a trade fee of 0.3%', async() => {
			let dexBalance = await dex.dexLiquidity();
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let pair2Liquidity = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('4325.844383287465599199'));
			assert.equal(poolLiquidity.toString(), tokens('1325.844383287465599199'));
			assert.equal(pair1Liquidity.toString(), tokens('200'));
			assert.equal(pair2Liquidity.toString(), tokens('1125.844383287465599199'));
		})
	})
	
})  