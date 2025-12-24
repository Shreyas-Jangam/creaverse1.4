# Creovate DAO Token (CDT) Smart Contracts

## Overview

This directory contains the Solidity smart contracts for Creovate DAO Token (CDT) and governance system.

## Contracts

### 1. CreovateDAOToken.sol
ERC-20 token with governance features:
- **Name**: Creovate DAO Token
- **Symbol**: CDT
- **Decimals**: 18
- **Features**:
  - Standard ERC-20 (transfer, approve, transferFrom, balanceOf, allowance)
  - Minting (MINTER_ROLE required)
  - Burning (any holder can burn their tokens)
  - Pausable transfers (PAUSER_ROLE required)
  - ERC20Permit for gasless approvals
  - ERC20Votes for governance delegation
  - Reentrancy protection

### 2. CreovateDAOGovernor.sol
OpenZeppelin Governor implementation:
- Proposal creation and voting
- Configurable voting delay and period
- Quorum requirements
- Timelock for executed proposals
- Delegation of voting rights

## Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @openzeppelin/contracts @nomicfoundation/hardhat-toolbox
```

### Testnet Deployment (Polygon Mumbai)
```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

### Mainnet Deployment
```bash
npx hardhat run scripts/deploy.ts --network polygon
```

## Contract Addresses

After deployment, update these addresses in your frontend:

```typescript
// src/lib/contracts.ts
export const CDT_TOKEN_ADDRESS = "0x..."; // Your deployed token address
export const GOVERNOR_ADDRESS = "0x...";  // Your deployed governor address
```

## Security Considerations

- All contracts use OpenZeppelin's audited implementations
- Role-based access control for privileged functions
- Reentrancy guards on state-changing functions
- Maximum supply cap to prevent inflation attacks
- Pausable for emergency situations

## Gas Optimization

- Uses Solidity 0.8.20+ built-in overflow checks
- Immutable variables where possible
- Efficient storage patterns

## Testing

```bash
npx hardhat test
npx hardhat coverage
```

## Network Configuration

Add to `hardhat.config.ts`:

```typescript
networks: {
  mumbai: {
    url: process.env.MUMBAI_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  },
  polygon: {
    url: process.env.POLYGON_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```
