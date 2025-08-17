# NailongMain Deployment on Katana Chain

## Overview
This guide explains how to deploy the `NailongMain` contract to the Katana chain using Foundry.

## Prerequisites
- Foundry installed
- Private key with KAT tokens for gas fees
- Access to Katana RPC: `https://rpc.tatara.katanarpc.com/`

## Configuration

### 1. Environment Setup
Create a `.env` file in the contracts directory:
```bash
PRIVATE_KEY=your_private_key_here
KATANA_RPC_URL=https://rpc.tatara.katanarpc.com/
```

### 2. Update Bridge Address
Before deployment, update the `BRIDGE_ADDRESS` in `script/DeployNailongMain.s.sol`:
```solidity
address constant BRIDGE_ADDRESS = 0xYOUR_ACTUAL_BRIDGE_ADDRESS;
```

The current vault address is set to: `0xd8063123BBA3B480569244AE66BFE72B6c84b00d`

## Deployment Steps

### 1. Install Dependencies
```bash
cd contracts
forge install
```

### 2. Compile Contracts
```bash
forge build
```

### 3. Deploy to Katana
```bash
# Deploy using the script
forge script script/DeployNailongMain.s.sol --rpc-url $KATANA_RPC_URL --broadcast

# Or deploy directly
forge create src/NailongMain.sol:NailongMain \
  --rpc-url https://rpc.tatara.katanarpc.com/ \
  --private-key $PRIVATE_KEY \
  --constructor-args 0xBRIDGE_ADDRESS 0xd8063123BBA3B480569244AE66BFE72B6c84b00d
```

### 4. Verify Deployment
After deployment, verify the contract:
```bash
# Check contract state
cast call <DEPLOYED_ADDRESS> "checkBalance(address)" <YOUR_ADDRESS> --rpc-url https://rpc.tatara.katanarpc.com/
```

## Contract Details

### NailongMain Contract
- **Purpose**: Main contract for handling bridge deposits and withdrawals
- **Constructor Parameters**:
  - `_bridgeAddress`: Address of the bridge contract
  - `_vaultAddress`: Address of the vault contract (0xd8063123BBA3B480569244AE66BFE72B6c84b00d)

### Key Functions
- `onMessageReceived`: Handles incoming bridge messages
- `checkBalance`: View function to check user balances
- `requestWithdraw`: Placeholder for withdrawal functionality

## Post-Deployment

### 1. Update Frontend
Update your frontend configuration with the new contract address.

### 2. Test Bridge Integration
Test the bridge message receiving functionality.

### 3. Monitor Events
Watch for `Deposited` events to verify the contract is working correctly.

## Troubleshooting

### Common Issues
1. **Insufficient KAT**: Make sure you have enough KAT tokens for gas fees
2. **Wrong RPC**: Verify you're using the correct Katana RPC URL
3. **Bridge Address**: Ensure the bridge address is correct for the Katana network

### Verification
- Check transaction status on Katana block explorer
- Verify contract bytecode matches source code
- Test view functions to ensure contract is working

## Network Information
- **Chain Name**: Katana
- **RPC URL**: https://rpc.tatara.katanarpc.com/
- **Currency**: KAT
- **Block Time**: Variable 