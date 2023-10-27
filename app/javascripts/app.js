
import "../stylesheets/app.css";


import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import { default as ethUtil} from 'ethereumjs-util';
import { default as sigUtil} from 'eth-sig-util';

import voting_artifacts from '../../build/contracts/Voting.json'

var Voting = contract(voting_artifacts);

let candidates = {"Aditya Kumar Singh": "candidate-1", "Tanmay Nevatia": "candidate-2", "Ashish Rawat": "candidate-3"}

window.submitVote = function(candidate) {
  let candidateName = $("#candidate-name").val();
  let signature = $("#voter-signature").val();
  let voterAddress = $("#voter-address").val();

  console.log(candidateName);
  console.log(signature);
  console.log(voterAddress);
  
  $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
  
  Voting.deployed().then(function(contractInstance) {
    contractInstance.voteForCandidate(candidateName, voterAddress, signature, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
      let div_id = candidates[candidateName];
      console.log(div_id);
      return contractInstance.totalVotesFor.call(candidateName).then(function(v) {
        console.log(v.toString());
        $("#" + div_id).html(v.toString());
        $("#msg").html("");
      });
    });
  });
}

window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();

  let msgParams = [
    {
      type: 'string',      
      name: 'Message',     
      value: 'Vote for ' + candidateName 
    }
  ]

  var from = web3.eth.accounts[0]

  var params = [msgParams, from]
  var method = 'eth_signTypedData'

  console.log("Hash is ");
  console.log(sigUtil.typedSignatureHash(msgParams));

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return console.error(result)
    $("#msg").html("User wants to vote for " + candidateName + ". Any one can now submit the vote to the blockchain on behalf of this user. Use the below values to submit the vote to the blockchain");
    $("#vote-for").html("Candidate: " + candidateName);
    $("#addr").html("Address: " + from);
    $("#signature").html("Signature: " + result.result);
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))
  })
}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Voting.setProvider(web3.currentProvider);
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function(contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function(v) {
        $("#" + candidates[name]).html(v.toString());
      });
    })
  }
});
