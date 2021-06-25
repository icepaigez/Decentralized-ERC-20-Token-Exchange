const DAppToken = artifacts.require("DAppToken");
const TeaToken = artifacts.require("TeaToken");
const LPToken = artifacts.require("LPToken");
const TokenSwap = artifacts.require("TokenSwap");



module.exports = async function(deployer) {
  await deployer.deploy(DAppToken);
  await deployer.deploy(TeaToken);
  await deployer.deploy(LPToken);

  const dapp = await DAppToken.deployed();
  const lpt = await LPToken.deployed();
  const tea = await TeaToken.deployed();

  await deployer.deploy(TokenSwap, dapp.address, lpt.address, tea.address);
  const dex = await TokenSwap.deployed();
  
  await lpt.transfer(dex.address, "1000000000000000000000000");
};
