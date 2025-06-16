const { ethers } = require("hardhat");

const FACTORY_ADDRESS = "";
const WALLETS = [];

const BATCH_SIZE = 50;

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function main() {
  const factory = await ethers.getContractAt("CloneFactory", FACTORY_ADDRESS);
  const [signer] = await ethers.getSigners();

  const owner = await factory.owner();
  console.log("Contract owner:", owner);
  console.log("Using signer address:", signer.address);

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`Caller is not the owner. Owner: ${owner}, Caller: ${signer.address}`);
  }

  console.log("Verifying wallets are valid clones...");
  const validWallets = [];
  for (const wallet of WALLETS) {
    try {
      const isClone = await factory.isClone(wallet);
      console.log(`Wallet ${wallet} isClone status:`, isClone);
      if (isClone) {
        validWallets.push(wallet);
      } else {
        console.warn(`Skipping invalid clone: ${wallet}`);
      }
    } catch (err) {
      console.error(`Error checking wallet ${wallet}:`, err);
    }
  }

  if (validWallets.length === 0) {
    console.log("No valid clones found to flush");
    return;
  }

  const batches = chunkArray(validWallets, BATCH_SIZE);
  let batchNum = 1;
  for (const batch of batches) {
    try {
      console.log(`Flushing batch ${batchNum}/${batches.length}:`, batch);

      const factoryInterface = factory.interface;

      const encodedData = factoryInterface.encodeFunctionData("flush", [batch]);
      console.log("Encoded function data:", encodedData);

      let gasEstimate;
      try {
        gasEstimate = await factory.flush.estimateGas(batch);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.error("Gas estimation failed. This usually means the transaction would revert.");
        console.error("Error details:", gasError.message);

        try {
          await factory.flush.staticCall(batch);
        } catch (staticError) {
          console.error("Static call failed with reason:", staticError.message);
        }

        gasEstimate = 5000000;
        console.log("Using fixed gas limit:", gasEstimate);
      }

      const tx = await signer.sendTransaction({
        to: FACTORY_ADDRESS,
        data: encodedData,
        gasLimit: gasEstimate
      });
      console.log("Transaction sent, waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(`✔ Batch ${batchNum} flushed. Tx hash: ${receipt.hash}`);
    } catch (err) {
      console.error(`❌ Flush failed for batch ${batchNum}:`, err);
      if (err.data) {
        console.error("Contract error data:", err.data);
      }
      if (err.reason) {
        console.error("Revert reason:", err.reason);
      }
      try {
        const decodedError = factory.interface.parseError(err.data);
        console.error("Decoded error:", decodedError);
      } catch (decodeError) {
        console.error("Could not decode error:", decodeError.message);
      }
      console.error("Full error:", err);
    }
    batchNum++;
  }
}

main().catch((err) => {
  console.error("Flush script failed:", err);
  process.exit(1);
});
