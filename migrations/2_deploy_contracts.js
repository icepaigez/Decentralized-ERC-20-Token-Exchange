const DAppToken = artifacts.require("DAppToken");
const LPToken = artifacts.require("LPToken");
const TokenSwap = artifacts.require("TokenSwap");



module.exports = async function(deployer) {
  await deployer.deploy(DAppToken);
  await deployer.deploy(LPToken);

  const dapp = await DAppToken.deployed();
  const lpt = await LPToken.deployed();

  await deployer.deploy(TokenSwap, dapp.address, lpt.address);
  const dex = await TokenSwap.deployed();
  
  await lpt.transfer(dex.address, "1000000000000000000000000");
};
