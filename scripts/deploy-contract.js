// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const RegistryFactory = await hre.ethers.getContractFactory("ERC721WRegistry");
  const registryContract = await RegistryFactory.deploy();

  await registryContract.deployed();

  const TestWcontractFactory = await hre.ethers.getContractFactory("TestingERC721Contract");
  const testingContract = await TestWcontractFactory.deploy();
  await testingContract.deployed();

  console.log("registryContract deployed to:", registryContract.address);
  console.log("testing erc721 contract deployed to:", testingContract.address);

  // const WContractFactory = await hre.ethers.getContractFactory("ERC721WContract");
  // const wContract = await WContractFactory.deploy();

  // await wContract.deployed();

  // console.log("wContract deployed to:", wContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
