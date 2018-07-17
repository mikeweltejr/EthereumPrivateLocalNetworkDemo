const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:30301'));
let contractAddress;
let InboxContract;
let account;

const getContract = async () => {
    account = await web3.eth.getCoinbase();
    await web3.eth.personal.unlockAccount(account, 'TestPassword');
    InboxContract = await new web3.eth.Contract(JSON.parse(interface), "0xBfE8Cb975f3e097570A429802390D613CAd232D2");
    contractAddress = InboxContract.options.address;

    setMessage();
}
getContract();

const setMessage = async () => {
  await InboxContract.methods.setMessage('This is now your new message 2222222!').send({from: account, gas: 200000});
  const newMessage = await InboxContract.methods.message().call();
  console.log(newMessage);
};

