const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:30301'));
let contractAddress;
let InboxContract;
let account;

const deploy = async () => {
  account = await web3.eth.getCoinbase();
  await web3.eth.personal.unlockAccount(account, 'TestPassword');
  console.log('Attempting to deploy from account', account);

  InboxContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: '0x' + bytecode, arguments: ['Hi Im the first message!'] })
    .send({ gas: '1000000', from: account });

  console.log('Contract deployed to', InboxContract.options.address);
  contractAddress = InboxContract.options.address;
};
deploy();
