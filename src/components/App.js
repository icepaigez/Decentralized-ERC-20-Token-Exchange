import React, { Component } from 'react';
import Web3 from 'web3';
import DAppToken from '../abis/DAppToken.json';
import LPToken from '../abis/LPToken.json';
import TokenSwap from '../abis/TokenSwap.json';
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
      dexAddress:""
    }
  }

  loadWeb3 = async () => {
    if (window.ethereum) {
      let web3 = await new Web3(Web3.givenProvider);
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
  }

  provideLiquidity = async(tokenQuantity, ethQuantity) => {
    const { dex, dapp, lpt, dexAddress, connectedUser, web3 } = this.state;
    const lptokensBalance = await lpt.methods.balanceOf(dexAddress).call()

    //check the pair names if this pair exist to determine which function to call
    const currentPairsArray = await dex.methods.returnPairs().call()
    if (currentPairsArray.length === 0) {
      const approve = await dapp.methods.approve(dexAddress, web3.utils.toWei(tokenQuantity, 'ether')).send({from:connectedUser})
      const { status } = approve;
      if (status) {
        const tokenSymbol = await dapp.methods.symbol().call();
        const provide = await dex.methods.initEthPair(web3.utils.toWei(tokenQuantity, 'ether'), `${tokenSymbol}-ETH`).send({from:connectedUser, value:web3.utils.toWei(ethQuantity)})
        if (provide.status) {
          await dex.methods.issueLPToken(connectedUser, lptokensBalance).send({from:connectedUser})
        }
      }
    } else {
      //there are existing pairs; check if this pair already exists
      console.log(currentPairsArray)
    }

  }

  async componentDidMount() {
    await this.loadWeb3()
    await this.provideLiquidity('2', '1.5')
  }

  render() {
    return (
      <div>
        <h1>ERC20 Dex</h1>
      </div>
    );
  }
}

export default App;
