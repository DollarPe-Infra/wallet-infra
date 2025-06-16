const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying AutoForwardWallet implementation...");
  const AutoForwardWallet = await ethers.getContractFactory("AutoForwardWallet");
  const impl = await AutoForwardWallet.deploy();
  await impl.waitForDeployment();
  const implAddress = await impl.getAddress();
  console.log(`✔ Implementation deployed at: ${implAddress}`);

  const forwardAddress = process.env.FORWARD_ADDRESS;
  if (!ethers.isAddress(forwardAddress)) throw new Error("Invalid forward address");

  console.log("Deploying CloneFactory...");
  const CloneFactory = await ethers.getContractFactory("CloneFactory");
  const factory = await CloneFactory.deploy(implAddress, forwardAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`✔ Factory deployed at: ${factoryAddress}`);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
