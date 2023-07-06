require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const { PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
const projectId = "yDwJmVFH28EJi_fCDd14d0CN9cz-ILUZ";

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${projectId}`,
      account: PRIVATE_KEY,
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
