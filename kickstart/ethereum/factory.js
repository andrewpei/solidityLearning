import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  CampaignFactory.abi,
  '0x0b3D28d78C8340f4795Da40FD53a534e85Fb86cA'
);

export default instance;
