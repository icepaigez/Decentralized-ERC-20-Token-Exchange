import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';

class App extends Component {

  constructor() {
    super()
    this.state = {
      connectedUser: "",
      userEthBalance: "0"
    }
  }

  loadWeb3 = async () => {
    if (window.ethereum) {
      let web3 = await new Web3(Web3.givenProvider);
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
    this.setState({userEthBalance})
  }

  async componentDidMount() {
    await this.loadWeb3()
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
