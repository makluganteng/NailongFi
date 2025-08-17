# Bridge Call Instructions

## Overview
This script executes a bridge call to the Polygon zkEVM bridge on Sepolia network.

## Function Call Details
- **Contract Address**: `0x1561e803442faDdD55580632f734fFc2E8Ee9E10` (Bridge contract on Sepolia)
- **Function**: `depositBridge`
- **Parameters**:
  - `destinationNetwork`: 29
  - `destinationAddress`: `0xca51855fba4aae768dcc273349995de391731e70`
  - `amount`: 0.01 ETH (10000000000000000 wei)
  - `token`: Native ETH (0x0000000000000000000000000000000000000000)
  - `forceUpdateGlobalExitRoot`: true
  - `data`: Custom bridge data

## Setup Instructions

### 1. Set Environment Variables
Create a `.env` file in the contracts directory:
```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
```

### 2. Install Dependencies
```bash
cd contracts
forge install
```

### 3. Execute the Bridge Call

#### Option A: Execute the exact encoded call
```bash
forge script script/ExecuteEncodedCall.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

#### Option B: Execute the clean function call
```bash
forge script script/BridgeCall.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

## Important Notes
- Make sure you have enough ETH on Sepolia for the transaction fee + 0.01 ETH for bridging
- The destination network ID 29 corresponds to a specific L2 network
- This will bridge 0.01 ETH to the specified destination address
- The transaction will require gas fees on Sepolia

## Verification
After execution, you can verify the transaction on Sepolia Etherscan and check the bridge status on the Polygon zkEVM bridge explorer. 