const { ethers } = require("hardhat");

const factoryAddress = process.env.FACTORY_ADDRESS;
const numberOfClones = 1;

async function main() {
  const factory = await ethers.getContractAt("CloneFactory", factoryAddress);

  console.log(`Creating ${numberOfClones} clones in one batch...`);

  const tx = await factory.createClones(numberOfClones);
  const receipt = await tx.wait();

  const clones = [];

  for (const log of receipt.logs) {
    try {
      const parsed = factory.interface.parseLog(log);
      if (parsed.name === "CloneCreated") {
        clones.push(parsed.args.clone);
      }
    } catch {
      console.log(error)
    }
  }

  if (clones.length === numberOfClones) {
    console.log(`✔ Successfully created ${clones.length} clones:`);
    clones.forEach((addr, i) => {
      console.log(`  Clone ${i + 1}: ${addr}`);
    });
  } else {
    console.warn(`⚠ Created ${clones.length} clones, expected ${numberOfClones}.`);
  }
}

main().catch((err) => {
  console.error("Clone creation failed:", err);
  process.exit(1);
});
