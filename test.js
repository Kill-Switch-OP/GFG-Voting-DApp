
import './ECRecovery.sol'; 
pragma solidity ^0.4.18;
contract MyContract {
    using ECRecovery for bytes32;
    function recover(bytes32 hash, bytes sig) public pure returns (address) {
        return hash.recover(sig);
    }
}

const ECRecovery = artifacts.require('./ECRecovery.sol')
const MyContract = artifacts.require('./MyContract.sol')

module.exports = function (deployer) {
  deployer.deploy(ECRecovery)
  deployer.link(ECRecovery, MyContract)
}

import hashMessage from './helpers/hashMessage.js' 
const MyContract = artifacts.require('MyContract')

contract('MyContract', accounts => {

  it('Test recover signer', async() => {
    contractInstance = await MyContract.deployed()
    const message = 'Hello Alice'
    const signAddress = web3.eth.accounts[0]
    const sig = web3.eth.sign(signAddress, web3.sha3(message))
    const hash = hashMessage(message)
    const result = await contractInstance.recover(hash, sig)
    assert.equal(signAddress, result, 'Recovered address should be same as signAddress')
  })
}
