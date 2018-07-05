# Setting up a Private Network

1. Download geth from: https://geth.ethereum.org/downloads/

2. Create directory for the project and create a `genesis.json` file with the following contents:

        {
            "alloc": {},
            "config": {
            "chainID": 72,
            "homesteadBlock": 0,
            "eip155Block": 0,
            "eip158Block": 0
            },
            "nonce": "0x0000000000000000",
            "difficulty": "0x4000",
            "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "coinbase": "0x0000000000000000000000000000000000000000",
            "timestamp": "0x00",
            "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "extraData": "0x11bbe8db4e347b4e8c937c1c8370e4b5ed33adb3db69cbdb7a38e1e50b1b82fa",
            "gasLimit": "0xffffffff"
        }

    * The chainid can be whatever you want it to be.
    * The homestead, eip, and byzantiumBlocks start at 0 because this is a new blockchain.
    * Difficulty will determine how long it takes for our blocks to be processed. Setting it between 10-10,000 will be a quick process time. For reference Ethereum mainnet uses 17179869184 for difficulty.
    * alloc - is allocating some test ether. You don't have to do this as it is very easy to generate test ether locally.

3. Open terminal as administrator and navigate to the path where geth is (on Windows this would be: C:\Program Files\Geth) or you can add it to your environment variables and run it anywhere.

4. Run `geth --datadir myDataDir init ./genesis.json` to initialize your blockchain with a data directory.
    * If you want to try creating multiple nodes locally, you will need to have a separate datadir for each node and you will have to use the same genesis.json for each node: `geth --datadir myDataDir2 init ./genesis.json`

5. Run the following command: `geth --datadir myDataDir --networkid 220022 --port 30301 --nodiscover console`

    * This will start the private network on a custom network (using 220022 here but use whatever number you'd like, and make sure any node connecting is using the networkid you use here).
    * It will open up a console to allow us to run web3 commands against it.
    * Specify which ever unused port you'd like here, the default assignment is 30303.
    * There are other parameters you may want to look at like --rpc --cors which will be helpful if utilizing remix/metamask.
    * The --nodiscover just tells geth not to look for peers initially. This is important with a private network, we don't want other nodes to try to connect to ours without explicitly telling them to.

6. If you're using 2 nodes, run the same command again against your other data directory with the same networkid but a different port:
    ```command
    geth --datadir myDataDir --networkid 220022 --port 30302 --nodiscover console
    ```

    * Might need to add the `--ipcdisable` flag for the second node. This is necessary when running local nodes, you can also specify different --ipcpath for each nodes to make this work.

7. In the javascript console run: `personal.newAccount("YOURPASSWORD")`

    * If using 2 nodes, do this in both.
    * Make sure to copy down the account address and password you used here.
    * The password parameter is optional here, you can just say newAccount() and it will prompt you for a password.

8. In the javascript console run: `eth.coinbase`

    * If using 2 nodes, do this in both.
    * This should be the account you just created as it is the first account that this node has created.
    * If it is not the same run `miner.setEtherbase(web3.eth.accounts[0])` to set it as the default. 
    * You can run the eth.coinbase command throughout to reference your account in case you did not copy it down earlier and want to retrieve it again.

9. In the console run: `personal.listWallets`

    * If using 2 nodes, do this in both.
    * You will notice here that the url will point to the data directory you configured for this node.
    * Feel free to check the data directory to see how the data is stored.

## Connecting Nodes as Peers (Skip this if not using 2 nodes)

1. In the console run `admin.peers`

    * This should be an empty array as of right now since we do not have any peers.
    * We need to tell each node to connect to the other node by sharing the enode address.

2. Run `admin.nodeInfo.enode`

    * This will get the enode address. You can run this on either node it does not matter which.
    * Copy down the enode address from whichever node you ran this on.

3. Navigate to the terminal for your other node and run `admin.addPeer(yourEnodeAddress)`

    * This will link the two nodes up.

4. Run `admin.peers` on either node and you should now see an actual node in the array!

## Mining and Ether Balance (Skip this if not using 2 nodes)

1. Run the following command in the console `eth.getBalance(eth.coinbase)`

    * Remember eth.coinbase is the account you added.
    * You should see 0 here if you followed the other steps. Good news is it's very easy to get some ether!

2. Run `miner.start()` on either node

    * Notice that each node is mining right now NOT just the one you did miner.start() on.
    * Let this run for a little bit (minute or two to get yourself rich on test ether) then run `miner.stop()` You might need to CTL + C to stop the process before running `miner.stop()`. You can also run >> myEth.log when running the console so everything outputs to a log and you don't have to see it running in your terminal.
    * You will need to run this for each node to get each account some ether.

3. Run the following commands on one node (does not matter which ones):

    * `coinbaseAddress = eth.coinbase`
    * `personal.unlockAccount(coinbaseAddress)`
    * Enter your password from earlier for the account you created.

4. Go to second node and get the account id `eth.coinbase`

5. Run on the same node as step 3 above run: `eth.sendTransaction({from: eth.coinbase, to: otherNodesAccountAddress, value: 100000000})`

    * Note: we are using so many 0s here because this is actually wei not ether. When thinking of wei vs ether (think of pennies vs dollars).
    * If you're curious you can run the following in the console `web3.fromWei(100000000, 'ether')` and it will convert from wei to ether.

6. Time to mine again! If you checked your balance on each account you should see that they are exactly the same. This is because we are not currently mining so the transaction is simply queued up. Run `miner.start()` on one node, then stop it and run it on the other node. You should now see a difference in the balance on each account.

    * You should notice that there is 1 transaction (1 tx) when you start mining. This is the transaction we just created!

# Creating a NodeJS API to Deploy and Interact with a Smart Contract

1. Run `npm install` to install dependencies in package.json.

2. Before deploying, start up your node with: `geth --datadir myDataDir --networkid 220022 --port 30301 --nodiscover console --rpc --rpcport 30301 --rpccorsdomain http://127.0.0.1`

3. Run `personal.unlockAccount(eth.coinbase)` to unlock the account (we could also do this in code but risks exposing the password for the account).

4. Run `miner.start()` to commit the contract to the network.

5. While the nodes are mining, open another command line window and run `node deploy.js`

    * This should console log out the contract address, make sure to write it down!
    * If your program is hanging, you probably forgot to start mining. 

        * If you get an error complaining about Invalid RPC Json it means you did not start your node up properly. make sure you included `--rpc --rpcport 30301 --rpccorsdomain http://127.0.0.1` when starting the node.

6. Run `node inboxActions.js` and it should output the new message you added!

## A closer look at these files

### Contract code should be in contracts/Inbox.sol

* If you have VSCode there is actually a solidity plugin! I'd suggest installing that just to make it look a bit nicer.
* We have the contracts folder which contains the Inbox.sol contract that we had previously done in remix.
* We have the compile.js file and a deploy.js file as well as our package.json.

### compile.js

* solc is the compiler for solidity files, there is a library called truffle which makes some of this a bit easier, but it's helpful to see the actual solidity compiler in action. If you really want replace the module.exports with console.log so you can see exactly what it compiles out to (NOTE: it will look very similiar to what you saw in remix).
* We have to do a readFile to read the contents of the file to actually compile it, we cannot simply send in the file.

### deploy.js
* Here we bring in web3 and the interface and bytecode from our compile folder (NOTE: you can replace this with the json file we made from remix if you'd like, whichever works best).
* If you are using the compile file you will need VS2017 build tools installed on your machine which can be found here: https://www.visualstudio.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=15
* We are creating a new Web3 with an HTTP provider pointing to our local private network:

    ```js
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:30301'));
    ```

* Here we go get the account that we created for that private network node: 

    ```js
    account = await web3.eth.getCoinbase();
    ```

* This will actually deploy the contract out to our network (remember replace interface and bytecode with the json file imports if you'd like):

    ```js
    InboxContract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: '0x' + bytecode, arguments: ['Hi Im the first message!'] })
        .send({ gas: '1000000', from: account });
    ```

### inboxActions.js

* Here we can now interact with our contract!!

* There will be a getContract method which will need you to input your contract address everything else should stay the same. If you used a different port make sure to change what is in this file.

* There is a setMessage method that will reset the existing message (we could do an array and add messages which would be more fit for an inbox, but keeping it simple for now).

* If you really want to test this you will need the Metamask extension available in Chrome or Firefox. Follow the steps to set up an account (it's pretty straightforward). Look at the top left of the Metamask extension and it should say "Main network" click the dropdown and select Custom RPC and put your URL where you deployed the contract locally. Now under the Run tab put your contract address to the left of the "At Address" and click the At Address button. This will generate an instance of your contract! From here you should be able to click the message button and see your new message!


## Creating a Smart Contract with Remix

1. This will require some code editor like VSCode or you can use http://remix.ethereum.org to develop. We will be using remix to get the information needed for deploying the contract as there are less dependencies with that.

2. In Remix take out the existing code and paste the following code in:

    ```solidity
    pragma solidity ^0.4.17;

    contract Inbox {
        string public message;

        function Inbox(string initialMessage) public {
            message = initialMessage;
        }

        function setMessage(string newMessage) public {
            message = newMessage;
        }
    }
    ```

3. Click on the Compile tab on the right and click the Details button.

4. Copy the abi (this is the interface for the contract) and the bytecode (only need the object field) and paste into inboxContract.json

    * Make sure to put 0x before the numbers you get from the bytecode otherwise it will not work.
    * See below for an example json for this (abi should be fairly similiar but bytecode should be drastically different):

        ```json
        {
            "abi": [
                {
                    "constant": false,
                    "inputs": [
                        {
                            "name": "newMessage",
                            "type": "string"
                        }
                    ],
                    "name": "setMessage",
                    "outputs": [],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "name": "initialMessage",
                            "type": "string"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "constant": true,
                    "inputs": [],
                    "name": "message",
                    "outputs": [
                        {
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "payable": false,
                    "stateMutability": "view",
                    "type": "function"
                }
            ],
            "bytecode": "0x6060604052341561000f57600080fd5b6040516103c13803806103c1833981016040528080518201919050508060009080519060200190610041929190610048565b50506100ed565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061008957805160ff19168380011785556100b7565b828001600101855582156100b7579182015b828111156100b657825182559160200191906001019061009b565b5b5090506100c491906100c8565b5090565b6100ea91905b808211156100e65760008160009055506001016100ce565b5090565b90565b6102c5806100fc6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063368b877214610051578063e21f37ce146100ae575b600080fd5b341561005c57600080fd5b6100ac600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509190505061013c565b005b34156100b957600080fd5b6100c1610156565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101015780820151818401526020810190506100e6565b50505050905090810190601f16801561012e5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b80600090805190602001906101529291906101f4565b5050565b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101ec5780601f106101c1576101008083540402835291602001916101ec565b820191906000526020600020905b8154815290600101906020018083116101cf57829003601f168201915b505050505081565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061023557805160ff1916838001178555610263565b82800160010185558215610263579182015b82811115610262578251825591602001919060010190610247565b5b5090506102709190610274565b5090565b61029691905b8082111561029257600081600090555060010161027a565b5090565b905600a165627a7a72305820c71e77da32574630ac9b90d78b247d0d334cff9b5fa6339306ec3008d3731c4a0029"
        }
        ```