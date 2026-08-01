import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CampusFeedback...");

  const Factory = await ethers.getContractFactory("CampusFeedback");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CampusFeedback deployed to:", address);
  console.log("Save this address — you'll need it for the frontend and verification.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
