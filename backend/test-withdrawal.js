// Simple test script to demonstrate the withdrawal API
// Make sure to set your OPERATOR_PRIVATE_KEY in .env file first

const testWithdrawal = async () => {
    const withdrawalData = {
        amount: "1000000000000000000", // 1 WETH (18 decimals)
        destinationNetwork: 1, // Ethereum mainnet
        destinationAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Example destination
        token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
        forceUpdateGlobalExitRoot: false,
        permitData: "0x"
    };

    try {
        const response = await fetch('http://localhost:3001/api/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(withdrawalData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Withdrawal successful:', result);
        } else {
            console.error('❌ Withdrawal failed:', result);
        }
    } catch (error) {
        console.error('❌ Error calling API:', error.message);
    }
};

const testVaultBalance = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/vault-balance');
        const result = await response.json();

        if (response.ok) {
            console.log('💰 Vault balance:', result);
        } else {
            console.error('❌ Failed to get vault balance:', result);
        }
    } catch (error) {
        console.error('❌ Error calling API:', error.message);
    }
};

const testContractInfo = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/contract-info');
        const result = await response.json();

        if (response.ok) {
            console.log('📋 Contract info:', result);
        } else {
            console.error('❌ Failed to get contract info:', result);
        }
    } catch (error) {
        console.error('❌ Error calling API:', error.message);
    }
};

// Run tests
console.log('🧪 Testing withdrawal API...\n');

console.log('1️⃣ Getting contract info...');
await testContractInfo();

console.log('\n2️⃣ Getting vault balance...');
await testContractInfo();

console.log('\n3️⃣ Testing withdrawal (this will fail if not admin)...');
await testWithdrawal();

console.log('\n✅ Tests completed!'); 