const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const fileName = 'campaign.sol'

const campaignPath = path.resolve(__dirname, 'contracts', fileName);
const source = fs.readFileSync(campaignPath, 'utf8');

const input = {
  language: "Solidity",
  sources: {
    [fileName]: {
      "content": source
    },
  },
  settings: {
  outputSelection: {
      '*': {
        '*': [ '*' ]
      }
    }
  }
}

const output = JSON.parse(solc.compile(JSON.stringify(input)));
fs.ensureDirSync(buildPath);

for (let contract in output.contracts[fileName]) {
  fs.outputJsonSync(
    path.resolve(buildPath, `${contract}.json`),
    output.contracts[fileName][contract]
  );
}

module.exports = output.contracts[fileName];
