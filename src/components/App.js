import React, { Component } from 'react';
import Web3 from 'web3';
import DAppToken from '../abis/DAppToken.json';
import TeaToken from '../abis/TeaToken.json';
import LPToken from '../abis/LPToken.json';
import TokenSwap from '../abis/TokenSwap.json';
import Navbar from "./NavBar/NavBar";
import Main from "./Main/Main";
import './App.css';

class App extends Component {
 
  constructor() {
    super()
    this.state = {
      web3:{},
      connectedUser: "",
      userEthBalance: "0",
      dex:{},
      dapp:{},
      lpt:{},
      tea:{},
      dexAddress:"",
      pools:[]
    }
  }

  loadWeb3 = async () => {
    if (window.ethereum) {
      let web3 = await new Web3(Web3.givenProvider || "http://localhost:7545");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.setState({ web3 })
      await this.loadBlockchainData(web3)
    } else {
      alert('You need to install a blockchain wallet')
    }
  }

  loadBlockchainData = async (web3) => {
    const accounts = await web3.eth.getAccounts()
    this.setState({
      connectedUser: accounts[0]
    })
    const userEthBalance = await web3.eth.getBalance(this.state.connectedUser)
    this.setState({ userEthBalance })

    //bring in the smart contracts in JS format
    //Exchange contract
    const dexAbi = TokenSwap.abi;
    const networkId = await web3.eth.net.getId();
    const dexData = TokenSwap.networks;
    if (dexData[networkId] !== undefined) {
       const dexAddress = dexData[networkId].address;
       const dex = new web3.eth.Contract(dexAbi, dexAddress);
       this.setState({ dex, dexAddress });
       let pools = await dex.methods.returnPairs().call();
       this.setState({ pools })
    } else {
      alert('Exchange Contract is not deployed to the detected network')
    }
    //token 1 contract
    const dappAbi = DAppToken.abi;
    const dappData = DAppToken.networks;
    if (dappData[networkId] !== undefined) {
      const dappAddress = dappData[networkId].address;
      const dapp = new web3.eth.Contract(dappAbi, dappAddress);
      this.setState({ dapp });
    }

    //token 2 contract
    const lptAbi = LPToken.abi;
    const lpData = LPToken.networks;
    if (lpData[networkId] !== undefined) {
      const lptAddress = lpData[networkId].address;
      const lpt = new web3.eth.Contract(lptAbi, lptAddress);
      this.setState({ lpt });
    }

    //token 3 contract
    const teaAbi = TeaToken.abi;
    const teaData = TeaToken.networks;
    if (teaData[networkId] !== undefined) {
      const teaAddress = teaData[networkId].address;
      const tea = new web3.eth.Contract(teaAbi, teaAddress);
      this.setState({ tea });
    }
  }

  provideETHPairLiquidity = async(tokenQuantity, ethQuantity, ethSymbol, tokenSymbol) => {
    let { dex, dapp, lpt, tea, dexAddress, connectedUser, web3 } = this.state;
    let lptokensBalance = await lpt.methods.balanceOf(dexAddress).call();
    let result;
    let symb1 = ethSymbol;
    let symb2 = tokenSymbol;
    const poolName = `${symb1}-${symb2}`
    lptokensBalance = web3.utils.fromWei(lptokensBalance, 'ether')
    tokenQuantity = String(tokenQuantity);
    ethQuantity = String(ethQuantity);
    let approve;
    if (tokenSymbol === 'DApp') {
      approve = await dapp.methods.approve(dexAddress, web3.utils.toWei(tokenQuantity, 'ether')).send({from:connectedUser})
    } else if (tokenSymbol === 'TEA') {
      approve = await tea.methods.approve(dexAddress, web3.utils.toWei(tokenQuantity, 'ether')).send({from:connectedUser})
    }

    //check the pair names if this pair exist to determine which function to call
    let currentPairsArray = await dex.methods.returnPairs().call()
    if (currentPairsArray.length === 0) {
      const { status } = approve;
      if (status) {
        result = await dex.methods.initEthPair(web3.utils.toWei(tokenQuantity, 'ether'), poolName, symb1, symb2).send({from:connectedUser, value:web3.utils.toWei(ethQuantity)})
        if (result.status) {
          //this needs to always reassign the new proportion of ownership 
          let totalPools = await dex.methods.returnPairs().call();
          totalPools = String(totalPools.length);
          let poolLiquidity = await dex.methods.pool(poolName).call();
          let currentLiquidity = await dex.methods.totalLiquidity(connectedUser, poolName).call();
          currentLiquidity = web3.utils.fromWei(currentLiquidity, 'ether')
          poolLiquidity = web3.utils.fromWei(poolLiquidity, 'ether')
          let lptokenIssued =  (currentLiquidity / poolLiquidity) * (lptokensBalance / totalPools);
          lptokenIssued = web3.utils.toWei(String(lptokenIssued), 'ether')
          await dex.methods.issueLPToken(connectedUser, lptokenIssued, poolName).send({from:connectedUser})
        }
      }
    } else {
      //there are existing pairs; check if this pair already exists
      let poolCheck = currentPairsArray.filter(pool => (pool.split('-').includes(symb1) && pool.split('-').includes(symb2)));
      const { status } = approve;
      if (poolCheck.length === 1) {//this pair already exists
        if (status) {
          result = await dex.methods.addEthPair(web3.utils.toWei(tokenQuantity, 'ether'), poolName, symb1, symb2).send({from:connectedUser, value:web3.utils.toWei(ethQuantity)})
          if (result.status) {
            let totalPools = await dex.methods.returnPairs().call();
            totalPools = String(totalPools.length);
            let poolLiquidity = await dex.methods.pool(poolName).call();
            let currentLiquidity = await dex.methods.totalLiquidity(connectedUser, poolName).call();
            currentLiquidity = web3.utils.fromWei(currentLiquidity, 'ether')
            poolLiquidity = web3.utils.fromWei(poolLiquidity, 'ether')
            let lptokenIssued =  (currentLiquidity / poolLiquidity) * (lptokensBalance / totalPools);
            lptokenIssued = web3.utils.toWei(String(lptokenIssued), 'ether')
            await dex.methods.issueLPToken(connectedUser, lptokenIssued, poolName).send({from:connectedUser})
          }
        }
      } else {
        if (status) {
          result = await dex.methods.initEthPair(web3.utils.toWei(tokenQuantity, 'ether'), poolName, symb1, symb2).send({from:connectedUser, value:web3.utils.toWei(ethQuantity)})
          if (result.status) {
            let totalPools = await dex.methods.returnPairs().call();
            totalPools = String(totalPools.length);
            let poolLiquidity = await dex.methods.pool(poolName).call();
            let currentLiquidity = await dex.methods.totalLiquidity(connectedUser, poolName).call();
            currentLiquidity = web3.utils.fromWei(currentLiquidity, 'ether')
            poolLiquidity = web3.utils.fromWei(poolLiquidity, 'ether')
            let lptokenIssued =  (currentLiquidity / poolLiquidity) * (lptokensBalance / totalPools);
            lptokenIssued = web3.utils.toWei(String(lptokenIssued), 'ether')
            await dex.methods.issueLPToken(connectedUser, lptokenIssued, poolName).send({from:connectedUser})
          }
        }
      }
    }
    return result;
  }

  provideTokenPairLiquidity = async(token1Quantity, token2Quantity, token1, token2) => {
    let { dex, dapp, lpt, dexAddress, connectedUser, web3, tea } = this.state;
    let lptokensBalance = await lpt.methods.balanceOf(dexAddress).call();
    let result;
    token1Quantity = String(token1Quantity);
    token2Quantity = String(token2Quantity);
    let approve1 = await dapp.methods.approve(dexAddress, web3.utils.toWei(token1Quantity, 'ether')).send({from:connectedUser})
    let approve2 = await tea.methods.approve(dexAddress, web3.utils.toWei(token2Quantity, 'ether')).send({from:connectedUser})
    lptokensBalance = web3.utils.fromWei(lptokensBalance, 'ether')
    const poolName = `${token1}-${token2}`;

    //check the pair names if this pair exist to determine which function to call
    const currentPairsArray = await dex.methods.returnPairs().call()
    if (currentPairsArray.length === 0) {//no pools at all in the dex
      if (approve1.status && approve2.status) {
        result = await dex.methods.initTokenPair(web3.utils.toWei(token1Quantity, 'ether'), web3.utils.toWei(token2Quantity, 'ether'), poolName, token1, token2).send({from:connectedUser})
        if (result.status) {
          //this needs to always reassign the new proportion of ownership 
          let totalPools = await dex.methods.returnPairs().call();
          totalPools = String(totalPools.length);
          let poolLiquidity = await dex.methods.pool(poolName).call();
          let currentLiquidity = await dex.methods.totalLiquidity(connectedUser, poolName).call();
          currentLiquidity = web3.utils.fromWei(currentLiquidity, 'ether')
          poolLiquidity = web3.utils.fromWei(poolLiquidity, 'ether')
          let lptokenIssued =  (currentLiquidity / poolLiquidity) * (lptokensBalance / totalPools);
          lptokenIssued = web3.utils.toWei(String(lptokenIssued), 'ether')
          await dex.methods.issueLPToken(connectedUser, lptokenIssued, poolName).send({from:connectedUser})
        }
      }
    } else {
      //there are existing pairs; check if this pair already exists
      let poolCheck = currentPairsArray.filter(pool => (pool.split('-').includes(token1) && pool.split('-').includes(token2)));
      if (poolCheck.length === 1) {//pair already exists
        if (approve1.status && approve2.status) {
           result = await dex.methods.addTokenPair(web3.utils.toWei(token1Quantity, 'ether'), web3.utils.toWei(token2Quantity, 'ether'), poolName, token1, token2).send({from:connectedUser})
           if (result.status) {
              let totalPools = await dex.methods.returnPairs().call();
              totalPools = String(totalPools.length);
              let poolLiquidity = await dex.methods.pool(poolName).call();
              let currentLiquidity = await dex.methods.totalLiquidity(connectedUser, poolName).call();
              currentLiquidity = web3.utils.fromWei(currentLiquidity, 'ether')
              poolLiquidity = web3.utils.fromWei(poolLiquidity, 'ether')
              let lptokenIssued =  (currentLiquidity / poolLiquidity) * (lptokensBalance / totalPools);
              lptokenIssued = web3.utils.toWei(String(lptokenIssued), 'ether')
              await dex.methods.issueLPToken(connectedUser, lptokenIssued, poolName).send({from:connectedUser})
           }
        }
      } else {//pair does not exist
        if (approve1.status && approve2.status) {
          result = await dex.methods.initTokenPair(web3.utils.toWei(token1Quantity, 'ether'), web3.utils.toWei(token2Quantity, 'ether'), poolName, token1, token2).send({from:connectedUser})
          if (result.status) {
            let totalPools = await dex.methods.returnPairs().call();
            totalPools = String(totalPools.length);
            let poolLiquidity = await dex.methods.pool(poolName).call();
            let currentLiquidity = await dex.methods.totalLiquidity(connectedUser, poolName).call();
            currentLiquidity = web3.utils.fromWei(currentLiquidity, 'ether')
            poolLiquidity = web3.utils.fromWei(poolLiquidity, 'ether')
            let lptokenIssued =  (currentLiquidity / poolLiquidity) * (lptokensBalance / totalPools);
            lptokenIssued = web3.utils.toWei(String(lptokenIssued), 'ether')
            await dex.methods.issueLPToken(connectedUser, lptokenIssued, poolName).send({from:connectedUser})
          }
        }
      }
    }
    return result;
  }

  // tradeEth = async(ethQuantity) => {
  //   let { dex, dapp, connectedUser, web3 } = this.state;
  //   let symb1 = 'ETH'
  //   let symb2 = await dapp.methods.symbol().call();
  //   const poolName = `${symb1}-${symb2}`
  //   let trade = await dex.methods.tradeEthforToken(poolName, symb1, symb2).send({from:connectedUser, value:web3.utils.toWei(ethQuantity)})
  //   console.log(trade)
  // }

  async componentDidMount() {
    await this.loadWeb3()
  }

  render() {
    const { connectedUser, pools, dex, web3 } = this.state;
    return (
      <div className="app">
        <Navbar user={connectedUser}/>
        <Main tokenLiquid={this.provideTokenPairLiquidity} web3={web3} dex={dex} pools={pools} ethLiquid={this.provideETHPairLiquidity}/>
      </div>
    );
  }
}

export default App;
