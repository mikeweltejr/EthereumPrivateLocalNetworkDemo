const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:30301'));
let contractAddress;
let InboxContract;
let account;

const getContract = async () => {
    account = await web3.eth.getCoinbase();
    InboxContract = await new web3.eth.Contract(JSON.parse(interface), "0x1A131bBF1346804e149A74a42cbD1cd46A41CA82");
    console.log('Contract deployed to', InboxContract.options.address);
    contractAddress = InboxContract.options.address;
    console.log(contractAddress);

    setMessage();
}
getContract();

const setMessage = async () => {
  await InboxContract.methods.setMessage('This is now your new message 2222222!').send({from: account, gas: 200000});
  const newMessage = await InboxContract.methods.message().call();
  console.log(newMessage);
};

