# Wallet Infra

This repository contains the smart contracts and deployment scripts for a simple
clonable wallet system on Arbitrum. The project is built with
[Hardhat](https://hardhat.org/) and uses OpenZeppelin libraries.

## Overview

Two contracts make up the core functionality:

- **`AutoForwardWallet`** – a minimal wallet that automatically forwards USDT and
  USDC balances to a predefined forwarding address when instructed by the
  factory. The contract is initialisable so that clones can be created cheaply.
- **`CloneFactory`** – creates clones of `AutoForwardWallet` using
  `ERC1167` minimal proxies. It keeps track of deployed clones and can call the
  `flush` function on any number of them in batches.

The contracts are designed to run on Arbitrum networks but can be deployed on
any EVM compatible chain.

## Repository Layout

```
contracts/                Solidity source files
scripts/                  Hardhat scripts for deployment and maintenance
ignition/modules/         Example Hardhat Ignition module
hardhat.config.cjs        Hardhat configuration
.env_init                 Example environment variable file
```

## Requirements

- Node.js 18+
- npm

Install the dependencies after cloning the repository:

```bash
npm install
```

## Environment Variables

Copy `.env_init` to `.env` and fill in the values for your environment:

```
ARBITRUM_SEPOLIA_RPC=<rpc-url>
PRIVATE_KEY=<deployer private key>
INFURA_API_KEY=<optional>
FORWARD_ADDRESS=<address that receives forwarded tokens>
FACTORY_ADDRESS=<deployed factory address for scripts>
```

`PRIVATE_KEY` must contain the key of the account that will deploy and manage
the contracts. `FORWARD_ADDRESS` is where USDT and USDC will be forwarded when a
wallet is flushed.

## Compiling Contracts

Use Hardhat to compile the contracts:

```bash
npx hardhat compile
```

## Deploying

The `scripts/deploy.js` script deploys the `AutoForwardWallet` implementation
and the `CloneFactory` contract. Ensure the environment variables are set and
run:

```bash
npx hardhat run scripts/deploy.js --network arbitrum
```

Replace `arbitrum` with `arbitrumSepolia` or another network configured in
`hardhat.config.cjs` as needed.

## Creating Clones

After the factory is deployed, clones of `AutoForwardWallet` can be created
using `scripts/createClones.js`:

```bash
FACTORY_ADDRESS=<factory> npx hardhat run scripts/createClones.js --network arbitrum
```

Adjust `numberOfClones` in the script to create more wallets in a single batch.

## Flushing Wallets

`scripts/flush.js` allows the owner of the factory to trigger forwarding of
funds from multiple clones. Edit the `FACTORY_ADDRESS` and `WALLETS` arrays in
the script before running:

```bash
npx hardhat run scripts/flush.js --network arbitrum
```

Each batch is limited to 50 addresses to avoid exceeding block gas limits.

## Hardhat Tasks

Some common Hardhat tasks are:

```bash
npx hardhat help                 # List all available tasks
npx hardhat test                 # Run tests (none provided)
REPORT_GAS=true npx hardhat test # Test with gas reporting
npx hardhat node                 # Start a local Hardhat node
```

## License

This project is released under the MIT License.
