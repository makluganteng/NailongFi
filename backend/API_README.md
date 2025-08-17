# NailongFi Withdrawal API

This Express.js API provides endpoints to interact with the NailongMain smart contract for withdrawing funds from the vault and bridging them to other networks.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file based on `env.example`:
   ```bash
   cp env.example .env
   ```
   
   Add your operator's private key:
   ```env
   OPERATOR_PRIVATE_KEY=your_private_key_here_without_0x_prefix
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
   
   The server will start on port 3001 (or the port specified in the PORT environment variable).

## 📋 API Endpoints

### 1. Health Check
- **GET** `/health`
- Returns server status and timestamp

### 2. Withdrawal Request
- **POST** `/api/withdraw`
- Triggers a withdrawal from the vault and bridges funds to the specified network

**Request Body:**
```json
{
  "amount": "1000000000000000000",
  "destinationNetwork": 1,
  "destinationAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "forceUpdateGlobalExitRoot": false,
  "permitData": "0x"
}
```

**Parameters:**
- `amount`: Amount to withdraw (in wei, as string)
- `destinationNetwork`: Network ID where funds should be bridged
- `destinationAddress`: Address to receive the bridged funds
- `token`: Token contract address on the destination network
- `forceUpdateGlobalExitRoot`: Whether to force update the global exit root (optional, default: false)
- `permitData`: Permit data for the token (optional, default: "0x")

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "blockNumber": "12345",
  "message": "Withdrawal request processed successfully"
}
```

### 3. Vault Balance
- **GET** `/api/vault-balance`
- Returns the current balance of the vault

**Response:**
```json
{
  "vaultAddress": "0x...",
  "wethAddress": "0x...",
  "balance": "1000000000000000000"
}
```

### 4. Contract Information
- **GET** `/api/contract-info`
- Returns contract configuration and addresses

**Response:**
```json
{
  "contractAddress": "0x...",
  "adminAddress": "0x...",
  "bridgeAddress": "0x...",
  "vaultAddress": "0x...",
  "wethAddress": "0x..."
}
```

## 🔐 Security

- **Admin Only**: Only the admin address can execute withdrawals
- **Private Key**: The operator's private key must be set in the `.env` file
- **Validation**: All input parameters are validated before processing

## 🧪 Testing

Use the provided test script to test the API:

```bash
node test-withdrawal.js
```

Make sure the server is running first!

## 📝 Example Usage

### cURL Example
```bash
curl -X POST http://localhost:3001/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000000000000000000",
    "destinationNetwork": 1,
    "destinationAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "token": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  }'
```

### JavaScript/Node.js Example
```javascript
const response = await fetch('http://localhost:3001/api/withdraw', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: "1000000000000000000",
    destinationNetwork: 1,
    destinationAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  })
});

const result = await response.json();
console.log(result);
```

## ⚠️ Important Notes

1. **Admin Access**: Only the admin address can execute withdrawals
2. **Vault Balance**: Ensure the vault has sufficient balance before attempting withdrawals
3. **Network Configuration**: Make sure the destination network and token addresses are correct
4. **Gas Fees**: The operator's wallet must have sufficient gas for transaction execution
5. **Private Key Security**: Never commit your private key to version control

## 🐛 Troubleshooting

- **403 Unauthorized**: Check if your private key corresponds to the admin address
- **400 Bad Request**: Verify all required parameters are provided and valid
- **500 Internal Server Error**: Check server logs for detailed error information

## 🔧 Configuration

The API uses the following configuration:
- **RPC URL**: `https://rpc.tatara.katanarpc.com/`
- **Contract Address**: `0x377DC7E60EF30Bce0a98bE68a1E1436f2fe4f58B`
- **Port**: 3001 (configurable via PORT environment variable) 