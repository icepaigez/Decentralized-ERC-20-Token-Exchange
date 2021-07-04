const TokenSwap = artifacts.require("TokenSwap");
const DAppToken = artifacts.require("DAppToken");
const TeaToken = artifacts.require("TeaToken");

function tokens(qty) {
	return web3.utils.toWei(qty, "ether");
}

async function checkOwnership(poolHold1, poolLiquid1, currentBal1, poolHold2, poolLiquid2, currentBal2) {
	poolHold1 = web3.utils.fromWei(poolHold1);
	poolHold2 = web3.utils.fromWei(poolHold2);
	poolLiquid1 = web3.utils.fromWei(poolLiquid1);
	poolLiquid2 = web3.utils.fromWei(poolLiquid2);
	currentBal1 = web3.utils.fromWei(currentBal1);
	currentBal2 = web3.utils.fromWei(currentBal2);
	let token = (poolHold1/poolLiquid1) * currentBal1;
	let tokenb = (poolHold2/ poolLiquid2) * currentBal2;
	return {
		token, tokenb 
	}
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

	describe('Provide new liquidity to an existing ETH-Token pool', async() => {
		let poolName, tok1Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			poolName = `${'ETH'}-${tok1Symbol}`;
			await token1.transfer(accounts[1], tokens('10000'),{from:accounts[0]});
			await token1.approve(dex.address, tokens("5000"), {from:accounts[1]});
			await dex.addEthPair(tokens("5000"), poolName, 'ETH', tok1Symbol, {from:accounts[1], value:tokens("1000")});
		})

		it('should accept new liquidity to an existing ETH-Token pool from a new user', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerBalance1 = await dex.liquidity(accounts[1]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let providerPoolBalance1 = await dex.totalLiquidity(accounts[1], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, 'ETH');
			let pair2Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let user1Eth = await dex.poolLiquidity(accounts[0], poolName, 'ETH');
			let user1Token = await dex.poolLiquidity(accounts[0], poolName, tok1Symbol);
			let user2Eth = await dex.poolLiquidity(accounts[1], poolName, 'ETH');
			let user2Token = await dex.poolLiquidity(accounts[1], poolName, tok1Symbol);

			assert.equal(dexBalance.toString(), tokens('7650'));
			assert.equal(pairs.length, 1);
			assert.equal(pairs[0], poolName);
			assert.equal(providerBalance.toString(), tokens('1650'));
			assert.equal(providerBalance1.toString(), tokens('6000'));
			assert.equal(providerPoolBalance.toString(), tokens('1650'));
			assert.equal(providerPoolBalance1.toString(), tokens('6000'));
			assert.equal(poolLiquidity.toString(), tokens('7650'));
			assert.equal(pair1Liquidity.toString(), tokens('1150'));
			assert.equal(pair2Liquidity.toString(), tokens('6500'));
			assert.equal(user1Eth, tokens('150'));
			assert.equal(user1Token, tokens('1500'));
			assert.equal(user2Eth, tokens('1000'));
			assert.equal(user2Token, tokens('5000'));
		})
	})

	describe('Provide Initial Token-Token Liquidity', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.approve(dex.address, tokens("1000"), {from:accounts[0]});
			await token2.approve(dex.address, tokens("3000"), {from:accounts[0]});
			await dex.initTokenPair(tokens("1000"), tokens("3000"), poolName, tok1Symbol, tok2Symbol, {from:accounts[0]});
		})

		it('should accept an Initial pair that has 2 ERC-20 Tokens', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let pair2Liquidity = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('11650'));
			assert.equal(pairs.length, 2);
			assert.equal(pairs[1], poolName);
			assert.equal(providerBalance.toString(), tokens('5650'));
			assert.equal(providerPoolBalance.toString(), tokens('4000')); //balance in this new pool
			assert.equal(poolLiquidity.toString(), tokens('4000'));
			assert.equal(pair1Liquidity.toString(), tokens('1000'));
			assert.equal(pair2Liquidity.toString(), tokens('3000'));
		})
	})

	describe('Provide additional liquidity to Token-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.approve(dex.address, tokens("500"), {from:accounts[0]});
			await token2.approve(dex.address, tokens("1500"), {from:accounts[0]});
			await dex.addTokenPair(tokens("500"), tokens("1500"), poolName, tok1Symbol, tok2Symbol, {from:accounts[0]});
		})

		it('should accept new liquidity to an existing Token-Token pool', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let pair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let pair2Liquidity = await dex.poolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('13650'));
			assert.equal(pairs.length, 2);
			assert.equal(pairs[1], poolName);
			assert.equal(providerBalance.toString(), tokens('7650'));
			assert.equal(providerPoolBalance.toString(), tokens('6000'));
			assert.equal(poolLiquidity.toString(), tokens('6000'));
			assert.equal(pair1Liquidity.toString(), tokens('1500'));
			assert.equal(pair2Liquidity.toString(), tokens('4500'));
		})
	})

	describe('Accept additional liquidity to Token-Token pool from a new user', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.approve(dex.address, tokens("4000"), {from:accounts[1]});
			await token2.transfer(accounts[1], tokens('10000'),{from:accounts[0]});//transfer tea tokens from acc[0] to acc[1] so that he can have liquidity to invest
			await token2.approve(dex.address, tokens("5000"), {from:accounts[1]});
			await dex.addTokenPair(tokens("4000"), tokens("5000"), poolName, tok1Symbol, tok2Symbol, {from:accounts[1]});
		})

		it('should accept new liquidity to an existing Token-Token pool from a new investor', async() => {
			let dexBalance = await dex.dexLiquidity();
			let pairs = await dex.returnPairs();
			let providerBalance = await dex.liquidity(accounts[0]);
			let providerBalance1 = await dex.liquidity(accounts[1]);
			let providerPoolBalance = await dex.totalLiquidity(accounts[0], poolName);
			let providerPoolBalance1 = await dex.totalLiquidity(accounts[1], poolName);
			let poolLiquidity = await dex.pool(poolName);
			let token1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let token2Liquidity = await dex.poolPair(poolName, tok2Symbol);
			let user1Token1 = await dex.poolLiquidity(accounts[0], poolName, tok1Symbol);
			let user1Token2 = await dex.poolLiquidity(accounts[0], poolName, tok2Symbol);
			let user2Token1 = await dex.poolLiquidity(accounts[1], poolName, tok1Symbol);
			let user2Token2 = await dex.poolLiquidity(accounts[1], poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('22650'));
			assert.equal(pairs.length, 2);
			assert.equal(pairs[1], poolName);	
			assert.equal(providerBalance.toString(), tokens('7650'));
			assert.equal(providerBalance1.toString(), tokens('15000'));
			assert.equal(providerPoolBalance.toString(), tokens('6000'));
			assert.equal(providerPoolBalance1.toString(), tokens('9000'));
			assert.equal(poolLiquidity.toString(), tokens('15000'));
			assert.equal(token1Liquidity.toString(), tokens('5500'));
			assert.equal(token2Liquidity.toString(), tokens('9500'));
			assert.equal(user1Token1, tokens('1500'));
			assert.equal(user1Token2, tokens('4500'));
			assert.equal(user2Token1, tokens('4000'));
			assert.equal(user2Token2, tokens('5000'));
		})
	})

	describe('Trade ether for a token from an ETH-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = 'ETH';
			tok2Symbol = await token1.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await dex.tradeEthforToken(poolName, tok1Symbol, tok2Symbol, {from:accounts[2], value:web3.utils.toWei('50')});
		})

		it('should accept ether from the trader and exchange it for a token after deducting a trade fee of 0.3%', async() => {
			let dexBalance = await dex.dexLiquidity();
			let poolLiquidity = await dex.pool(poolName);
			let oldPair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let oldPair2Liquidity = await dex.poolPair(poolName, tok2Symbol);
			let newPair1Liquidity = await dex.newPoolPair(poolName, tok1Symbol);
			let newPair2Liquidity = await dex.newPoolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('22429.945409842897028795'));
			assert.equal(poolLiquidity.toString(), tokens('7429.945409842897028795'));
			assert.equal(oldPair1Liquidity.toString(), tokens('1150.000000000000000000'));
			assert.equal(oldPair2Liquidity.toString(), tokens('6500.000000000000000000'));
			assert.equal(newPair1Liquidity.toString(), tokens('1200.000000000000000000'));
			assert.equal(newPair2Liquidity.toString(), tokens('6229.945409842897028795'));
		})
	})

	describe('Trade token for a ether from an ETH-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = 'ETH';
			tok2Symbol = await token1.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.transfer(accounts[3], tokens('10000'),{from:accounts[0]});//
			await token1.approve(dex.address, tokens("5000"), {from:accounts[3]});
			await dex.tradeTokenforEth(tokens("5000"), poolName, tok1Symbol, tok2Symbol, {from:accounts[3]});
		})

		it('should accept a token from the trader and exchange it for ether after deducting a trade fee of 0.3%', async() => {
			let dexBalance = await dex.dexLiquidity();
			let poolLiquidity = await dex.pool(poolName);
			let oldPair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let oldPair2Liquidity = await dex.poolPair(poolName, tok2Symbol);
			let newPair1Liquidity = await dex.newPoolPair(poolName, tok1Symbol);
			let newPair2Liquidity = await dex.newPoolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('26896.550035956382676331'));
			assert.equal(poolLiquidity.toString(), tokens('11896.550035956382676331'));
			assert.equal(oldPair1Liquidity.toString(), tokens('1150'));
			assert.equal(oldPair2Liquidity.toString(), tokens('6500'));
			assert.equal(newPair1Liquidity.toString(), tokens('666.604626113485647536'));
			assert.equal(newPair2Liquidity.toString(), tokens('11229.945409842897028795'));
		})
	})

	describe('Trade token-A for another token-B from a Token-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.transfer(accounts[4], tokens('10000'),{from:accounts[0]});
			await token2.transfer(accounts[4], tokens('10000'),{from:accounts[0]});
			await token2.approve(dex.address, tokens("500"), {from:accounts[4]});
			await dex.tradeTokenforToken(tokens("500"), tok2Symbol, poolName, tok1Symbol, tok2Symbol, {from:accounts[4]});
		})

		it('should accept token-A from the trader and exchange it for token-B in the pool after deducting a trade fee of 0.3%', async() => {
			let dexBalance = await dex.dexLiquidity();
			let poolLiquidity = await dex.pool(poolName);
			let oldPair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let oldPair2Liquidity = await dex.poolPair(poolName, tok2Symbol);
			let newPair1Liquidity = await dex.newPoolPair(poolName, tok1Symbol);
			let newPair2Liquidity = await dex.newPoolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('27122.333903536519696884'));
			assert.equal(poolLiquidity.toString(), tokens('15225.783867580137020553'));
			assert.equal(oldPair1Liquidity.toString(), tokens('5500'));
			assert.equal(oldPair2Liquidity.toString(), tokens('9500'));
			assert.equal(newPair1Liquidity.toString(), tokens('5225.783867580137020553'));
			assert.equal(newPair2Liquidity.toString(), tokens('10000'));
		})
	})

	describe('Trade token-B for another token-A from a Token-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = await token1.symbol();
			tok2Symbol = await token2.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			await token1.transfer(accounts[5], tokens('10000'),{from:accounts[0]});
			await token2.transfer(accounts[5], tokens('10000'),{from:accounts[0]});
			await token1.approve(dex.address, tokens("5000"), {from:accounts[5]});
			await dex.tradeTokenforToken(tokens("5000"), tok1Symbol, poolName, tok1Symbol, tok2Symbol, {from:accounts[5]});
		})

		it('should accept token-B from the trader and exchange it for token-A in the pool after deducting a trade fee of 0.3%', async() => {
			let dexBalance = await dex.dexLiquidity();
			let poolLiquidity = await dex.pool(poolName);
			let oldPair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let oldPair2Liquidity = await dex.poolPair(poolName, tok2Symbol);
			let newPair1Liquidity = await dex.newPoolPair(poolName, tok1Symbol);
			let newPair2Liquidity = await dex.newPoolPair(poolName, tok2Symbol);

			assert.equal(dexBalance.toString(), tokens('27240.240555318975165157'));
			assert.equal(poolLiquidity.toString(), tokens('15343.690519362592488826'));
			assert.equal(oldPair1Liquidity.toString(), tokens('5500'));
			assert.equal(oldPair2Liquidity.toString(), tokens('9500'));
			assert.equal(newPair1Liquidity.toString(), tokens('10225.783867580137020553'));
			assert.equal(newPair2Liquidity.toString(), tokens('5117.906651782455468273'));
		})
	})

	describe('Withdraw part liquidity from an ETH-Token pool', async() => {
		let poolName, tok1Symbol, tok2Symbol;
		before(async() => {
			tok1Symbol = 'ETH';
			tok2Symbol = await token1.symbol();
			poolName = `${tok1Symbol}-${tok2Symbol}`;
			let user = accounts[0]
			let poolHold1 = await dex.poolLiquidity(user, poolName, tok1Symbol);//100ETH
			let poolHold2 = await dex.poolLiquidity(user, poolName, tok2Symbol);//1000 DAPP
			let poolLiquid1 = await dex.poolPair(poolName, tok1Symbol); //150 ETH old
			let poolLiquid2 = await dex.poolPair(poolName, tok2Symbol);//1500 DAPP
			let currentBal1 = await dex.newPoolPair(poolName, tok1Symbol);//200 ETH
			let currentBal2 = await dex.newPoolPair(poolName, tok2Symbol);//1125DAPP
			let resultObj = await checkOwnership(poolHold1, poolLiquid1, currentBal1, poolHold2, poolLiquid2, currentBal2);
			let { token, tokenb } = resultObj;
			token = String(token);
			tokenb = String(tokenb);
			await dex.withdraw(poolName, tok1Symbol, tokens('50'), tokens('500'), tok2Symbol, tokens(token), tokens(tokenb));
		})

		it('should reduce the liquidity in a pool after a withdrawal has been made', async() => {
			let dexBalance = await dex.dexLiquidity();
			let providerBalance = await dex.liquidity(accounts[0]);
			let poolLiquidity = await dex.pool(poolName);
			let oldPair1Liquidity = await dex.poolPair(poolName, tok1Symbol);
			let oldPair2Liquidity = await dex.poolPair(poolName, tok2Symbol);
			let newPair1Liquidity = await dex.newPoolPair(poolName, tok1Symbol);
			let newPair2Liquidity = await dex.newPoolPair(poolName, tok2Symbol);
			let user1Eth = await dex.poolLiquidity(accounts[0], poolName, tok1Symbol);
			let user1Token = await dex.poolLiquidity(accounts[0], poolName, tok2Symbol);
			let user2Eth = await dex.poolLiquidity(accounts[1], poolName, tok1Symbol);
			let user2Token = await dex.poolLiquidity(accounts[1], poolName, tok2Symbol);
			
			assert.equal(dexBalance.toString(), tokens('26690.240555318975165157'));
			assert.equal(poolLiquidity.toString(), tokens('11346.550035956382676331'));
			assert.equal(oldPair1Liquidity.toString(), tokens('1100'));
			assert.equal(oldPair2Liquidity.toString(), tokens('6000'));
			assert.equal(user1Eth.toString(), tokens('100'));
			assert.equal(user1Token.toString(), tokens('1000'));
			assert.equal(user2Eth.toString(), tokens('1000'));
			assert.equal(user2Token.toString(), tokens('5000'));
			assert.equal(newPair1Liquidity.toString(), tokens('616.604626113485647536'));
			assert.equal(newPair2Liquidity.toString(), tokens('10729.945409842897028795'));
		})
	})
})  