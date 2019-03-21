const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledCampaign = require('../ethereum/build/Campaign.json');
const compiledCampaignFactory = require('../ethereum/build/CampaignFactory.json');
const abiCampaign = compiledCampaign.abi;
const bytecodeCampaign = compiledCampaign.evm.bytecode.object;
const abiFactory = compiledCampaignFactory.abi;
const bytecodeFactory = compiledCampaignFactory.evm.bytecode.object;

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(abiFactory)
    .deploy({ data: `0x${bytecodeFactory}` })
    .send({ from: accounts[0], gas: '5000000'})
  
  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
  campaign = await new web3.eth.Contract(abiCampaign, campaignAddress);
});

describe('Campaign',  () => {
  it('deploys a factory and a campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('requires a min contribution', async () => {
    try {
      await campaign.methods.contribute().send({
        value: '5',
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('let\'s people contribute and marks them as approvers', async () => {
    await campaign.methods.contribute().send({
      value: '200',
      from: accounts[1]
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('let\'s only the manager to create requests', async () => {
    await campaign.methods.createRequest('Buy supplies', '1000', accounts[1])
      .send({
        from: accounts[0],
        gas: '1000000'
      })

    const request = await campaign.methods.requests(0).call();
    assert.equal(request.description, 'Buy supplies');
  });

  it('processes requests', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether')
    });

    await campaign.methods
      .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
      .send({ from: accounts[0], gas: '1000000' });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});
