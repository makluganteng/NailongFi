import { createPublicClient, http, formatEther, parseEther } from 'viem';

const publicClient = createPublicClient({
    transport: http("https://rpc.tatara.katanarpc.com/")
});

// Contract addresses
const NAILONG_MAIN_ADDRESS = "0x4F43F6377ADe881F344b5C19ce277bCc45775939";
const WETH_ADDRESS = "0x902E242EFfceb736d3FA00d3e9dBB021015bF3Df";
const VAULT_ADDRESS = "0xccC0Fc2E34428120f985b460b487eB79E3C6FA57";

// ABI for the functions we need
const NAILONG_ABI = [
    {
        inputs: [],
        name: 'getContractBalances',
        outputs: [
            { name: 'ethBalance', type: 'uint256' },
            { name: 'wethBalance', type: 'uint256' }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'ADMIN_ADDRESS',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'VAULT_ADDRESS',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'WETH_ADDRESS',
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function'
    }
];

const WETH_ABI = [
    {
        inputs: [],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function'
    },
    {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];

const VAULT_ABI = [
    {
        inputs: [
            { name: 'assets', type: 'uint256' },
            { name: 'receiver', type: 'address' }
        ],
        name: 'deposit',
        outputs: [{ name: 'shares', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function'
    }
];

async function debugContract() {
    try {
        console.log("=== Debugging NailongMain Contract ===");

        // 1. Check contract balances
        console.log("\n1. Checking contract balances...");
        const balances = await publicClient.readContract({
            address: NAILONG_MAIN_ADDRESS,
            abi: NAILONG_ABI,
            functionName: 'getContractBalances',
        });
        console.log("ETH Balance:", formatEther(balances[0]));
        console.log("WETH Balance:", formatEther(balances[1]));

        // 2. Check admin address
        console.log("\n2. Checking admin address...");
        const adminAddress = await publicClient.readContract({
            address: NAILONG_MAIN_ADDRESS,
            abi: NAILONG_ABI,
            functionName: 'ADMIN_ADDRESS',
        });
        console.log("Admin Address:", adminAddress);

        // 3. Check vault address
        console.log("\n3. Checking vault address...");
        const vaultAddress = await publicClient.readContract({
            address: NAILONG_MAIN_ADDRESS,
            abi: NAILONG_ABI,
            functionName: 'VAULT_ADDRESS',
        });
        console.log("Vault Address:", vaultAddress);

        // 4. Check WETH address
        console.log("\n4. Checking WETH address...");
        const wethAddress = await publicClient.readContract({
            address: NAILONG_MAIN_ADDRESS,
            abi: NAILONG_ABI,
            functionName: 'WETH_ADDRESS',
        });
        console.log("WETH Address:", wethAddress);

        // 5. Check if WETH contract has deposit function
        console.log("\n5. Checking WETH contract...");
        try {
            const wethBalance = await publicClient.readContract({
                address: wethAddress,
                abi: WETH_ABI,
                functionName: 'balanceOf',
                args: [NAILONG_MAIN_ADDRESS],
            });
            console.log("WETH Balance of contract:", formatEther(wethBalance));
        } catch (error) {
            console.log("❌ WETH contract error:", error.message);
        }

        // 6. Check if vault contract has deposit function
        console.log("\n6. Checking vault contract...");
        try {
            // Try to read a simple function to see if contract exists
            const vaultCode = await publicClient.getBytecode({ address: vaultAddress });
            if (vaultCode && vaultCode !== '0x') {
                console.log("✅ Vault contract exists");
            } else {
                console.log("❌ Vault contract doesn't exist or is empty");
            }
        } catch (error) {
            console.log("❌ Vault contract error:", error.message);
        }

        // 7. Check ETH balance of the contract
        console.log("\n7. Checking ETH balance...");
        const ethBalance = await publicClient.getBalance({ address: NAILONG_MAIN_ADDRESS });
        console.log("Contract ETH Balance:", formatEther(ethBalance));

    } catch (error) {
        console.error("❌ Debug failed:", error);
    }
}

debugContract(); 