const DAppToken = artifacts.require("DAppToken");
const TokenSwap = artifacts.require("TokenSwap");

module.exports = async function(deployer) {
  await deployer.deploy(DAppToken);
  const dapp = await DAppToken.deployed();

  await deployer.deploy(TokenSwap, dapp.address);
};
