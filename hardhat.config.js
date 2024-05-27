require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.8",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      11155111: 1,
    },
    user: {},
  },
};
