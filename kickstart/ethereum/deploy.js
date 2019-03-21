const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const compiledCampaignFactory = require('./build/CampaignFactory.json');
const abiFactory = compiledCampaignFactory.abi;
const bytecodeFactory = compiledCampaignFactory.evm.bytecode.object;

const provider = new HDWalletProvider(
  'wall put suspect street harbor victory vessel bacon whale cube bar lady',
  'https://rinkeby.infura.io/v3/f6f6234bc378471cbc044834503f9e60'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  const result = await new web3.eth.Contract(abiFactory)
    .deploy({ data: `0x${bytecodeFactory}` })
    .send({ gas: '5000000', from: accounts[0] });

  console.log('Deployed at this address ', result.options.address);
};

deploy();