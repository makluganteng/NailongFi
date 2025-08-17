import { ethers } from 'ethers'
import NailongMain from './abi/NailongMain.json'
import cron from 'node-cron';
import dotenv from 'dotenv'
import { updateTransactionHistoryStatus } from './supabase/supabase';

// Load environment variables
dotenv.config()

// Katana network configuration
const KATANA_RPC_URL = "https://rpc.tatara.katanarpc.com/"
const KATANA_CHAIN_ID = 129399

export const run = async () => {
    // Create provider
    const provider = new ethers.JsonRpcProvider(KATANA_RPC_URL)

    const contractAddress = "0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4"

    try {
        // Get the latest block number
        const latestBlock = await provider.getBlockNumber()
        console.log("Latest block:", latestBlock.toString())

        // Get logs from the last 1000 blocks (adjust as needed)
        const fromBlock = 15132989

        const toBlock = latestBlock

        console.log(`Fetching logs from block ${fromBlock} to ${toBlock}`)

        // Get logs for the Transfer event
        const logs = await provider.getLogs({
            address: contractAddress,
            topics: [
                ethers.id("Transfer(address,address,uint256)"),
                ethers.zeroPadValue("0x0000000000000000000000000000000000000000", 32), // from address
                ethers.zeroPadValue("0x9758163C44D813FEc380798A11CCf4531A3Fa3D3", 32)  // to address
            ],
            fromBlock,
            toBlock,
        })

        console.log(`Found ${logs.length} Transfer logs:`)

        let collectedLogs = []
        let totalAmount = 0
        let userAddress = ""
        logs.forEach(async (log, index) => {
            // Decode the log data
            const iface = new ethers.Interface([
                "event Transfer(address indexed from, address indexed to, uint256 value)"
            ])
            const decodedLog = iface.parseLog(log)

            if (decodedLog) {
                collectedLogs.push(log)
                totalAmount += Number(decodedLog.args[2]) // value is the third argument
                const transaction = await provider.getTransaction(log.transactionHash)
                if (transaction && transaction.data) {
                    // If you have the contract ABI, you can decode the input data
                    try {
                        const contractInterface = new ethers.Interface([
                            // Add the function signatures you want to decode
                            "function claimAsset(bytes32[32],bytes32[32],uint256,bytes32,bytes32,uint32,address,uint32,address,uint256,bytes)"
                        ])

                        const decodedData = contractInterface.parseTransaction({ data: transaction.data })
                        if (decodedData) {
                            console.log(`Deposit Count: ${decodedData.args[2]}`)
                            const maskedDepositCount = decodedData.args[2] & BigInt("0xFFFFFFFFFFFFFFFF")
                            console.log(`Masked Deposit Count: ${maskedDepositCount}`)
                            const { data: updatedData, error } = await updateTransactionHistoryStatus(maskedDepositCount.toString())
                            if (updatedData) {
                                console.log(`Updated Data: ${updatedData[0].user_address}`)
                                userAddress = updatedData[0].user_address
                                await executeToVault(Number(decodedLog.args[2]), userAddress)
                            }
                        }
                    } catch (error) {
                        console.log(`Raw transaction data: ${transaction.data}`)
                    }
                }

                console.log(`Log ${index + 1}:`)
                console.log(`  Block: ${log.blockNumber}`)
                console.log(`  Transaction Hash: ${log.transactionHash}`)
                console.log(`  Log Index: ${index}`)
                console.log(`  Decoded Data:`)
                console.log(`    from: ${decodedLog.args[0]}`)
                console.log(`    to: ${decodedLog.args[1]}`)
                console.log(`    value: ${decodedLog.args[2]}`)

            }
        })

        console.log(`Collected ${collectedLogs.length} logs for destination address`)
        console.log(`Total amount collected: ${totalAmount}`)


        if (logs.length === 0) {
            console.log("No Transfer logs found in the last 1000 blocks.")
            console.log("You might need to increase the block range or check if the event has been emitted.")
        }

    } catch (error) {
        console.error("Error fetching logs:", error)
    }
}

const wrapEthToWeth = async () => {
    try {
        const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY

        if (!operatorPrivateKey) {
            throw new Error("OPERATOR_PRIVATE_KEY environment variable is not set")
        }

        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(KATANA_RPC_URL)
        const wallet = new ethers.Wallet(operatorPrivateKey, provider)

        const weth = "0x902E242EFfceb736d3FA00d3e9dBB021015bF3Df"
        const wethAbi = [
            {
                inputs: [],
                name: 'deposit',
                outputs: [],
                stateMutability: 'payable',
                type: 'function'
            }
        ]

        const parsedValue = ethers.parseEther("0.01")

        // Create WETH contract instance
        const wethContract = new ethers.Contract(weth, wethAbi, wallet)

        // Execute the deposit transaction
        const tx = await wethContract.deposit({ value: parsedValue })
        console.log(`Wrap transaction hash: ${tx.hash}`)

        const receipt = await tx.wait()
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
        console.log("ETH wrapped to WETH successfully")
    } catch (error) {
        console.error("Error wrapping ETH to WETH:", error)
    }
}

const executeToVault = async (amount: number, address: string) => {
    try {
        // Get operator private key from environment variable
        const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY

        if (!operatorPrivateKey) {
            throw new Error("OPERATOR_PRIVATE_KEY environment variable is not set")
        }

        // Create provider and wallet
        const provider = new ethers.JsonRpcProvider(KATANA_RPC_URL)
        const wallet = new ethers.Wallet(operatorPrivateKey, provider)

        console.log(`Operator wallet address: ${wallet.address}`)
        console.log(`Executing vault transaction with amount: ${amount}`)

        // Use the NailongMain contract address and ABI
        const nailongContractAddress = "0x9758163C44D813FEc380798A11CCf4531A3Fa3D3"
        const nailongAbi = [
            {
                inputs: [{ name: 'amount', type: 'uint256' }, { name: 'user', type: 'address' }],
                name: 'executeToVault',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'wrapEthToWeth',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'getContractBalances',
                outputs: [
                    { name: 'ethBalance', type: 'uint256' },
                    { name: 'wethBalance', type: 'uint256' }
                ],
                stateMutability: 'view',
                type: 'function'
            }
        ]

        // Create contract instance
        const nailongContract = new ethers.Contract(nailongContractAddress, nailongAbi, wallet)

        // Check the ETH balance in the contract
        const ethBalance = await provider.getBalance(nailongContractAddress)
        console.log(`ETH balance in the contract: ${ethers.formatEther(ethBalance)} ETH`)

        // If there is ETH in the contract, wrap it to WETH
        if (ethBalance > 0) {
            console.log(`Wrapping ${ethers.formatEther(ethBalance)} ETH to WETH...`)

            const wrapTx = await nailongContract.wrapEthToWeth()
            console.log(`Wrap transaction hash: ${wrapTx.hash}`)

            const wrapReceipt = await wrapTx.wait()
            console.log(`Wrap transaction confirmed in block ${wrapReceipt.blockNumber}`)
            console.log("Wrap completed successfully")
        }

        const parsedValue = ethers.parseEther("0.01")

        // Execute the vault transaction
        console.log(`Executing executeToVault with amount: ${ethers.formatEther(parsedValue)} ETH`)

        const tx = await nailongContract.executeToVault(parsedValue, address)
        console.log(`Vault transaction hash: ${tx.hash}`)

        // Wait for transaction confirmation
        const receipt = await tx.wait()
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
        console.log("Vault execution completed successfully")

    } catch (error) {
        console.error("Error executing vault transaction:", error)
        throw error
    }
}

// Run the function
// Uncomment to run the main function


// Run every 10 minutes
cron.schedule('*/10 * * * *', () => {
    run().catch(console.error);
});

// run().catch(console.error)
// executeToVault(1000000000000000000).catch(console.error)
// wrapEthToWeth().catch(console.error)

// const depositToVault = async (amount: number) => {
//     try {
//         const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY

//         if (!operatorPrivateKey) {
//             throw new Error("OPERATOR_PRIVATE_KEY environment variable is not set")
//         }

//         // Create provider and wallet
//         const provider = new ethers.JsonRpcProvider(KATANA_RPC_URL)
//         const wallet = new ethers.Wallet(operatorPrivateKey, provider)

//         const weth = "0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4"
//         const wethAbi = [
//             {
//                 inputs: [],
//                 name: 'deposit',
//                 outputs: [],
//                 stateMutability: 'payable',
//                 type: 'function'
//             },
//             {
//                 inputs: [{ name: 'amount', type: 'uint256' }],
//                 name: 'withdraw',
//                 outputs: [],
//                 stateMutability: 'nonpayable',
//                 type: 'function'
//             },
//             {
//                 inputs: [{ name: 'account', type: 'address' }],
//                 name: 'balanceOf',
//                 outputs: [{ name: '', type: 'uint256' }],
//                 stateMutability: 'view',
//                 type: 'function'
//             },
//             {
//                 inputs: [
//                     { name: 'spender', type: 'address' },
//                     { name: 'amount', type: 'uint256' }
//                 ],
//                 name: 'approve',
//                 outputs: [{ name: '', type: 'bool' }],
//                 stateMutability: 'nonpayable',
//                 type: 'function'
//             },
//             {
//                 inputs: [
//                     { name: 'to', type: 'address' },
//                     { name: 'amount', type: 'uint256' }
//                 ],
//                 name: 'transfer',
//                 outputs: [{ name: '', type: 'bool' }],
//                 stateMutability: 'nonpayable',
//                 type: 'function'
//             },
//             {
//                 inputs: [
//                     { name: 'from', type: 'address' },
//                     { name: 'to', type: 'address' },
//                     { name: 'amount', type: 'uint256' }
//                 ],
//                 name: 'transferFrom',
//                 outputs: [{ name: '', type: 'bool' }],
//                 stateMutability: 'nonpayable',
//                 type: 'function'
//             }
//         ]

//         const nailongContractAddress = "0x5d7F21089decc3145C603eC3cdC4D6330dE89DF2"
//         const nailongAbi = NailongMain.abi

//         // Create WETH contract instance
//         const wethContract = new ethers.Contract(weth, wethAbi, wallet)

//         // Deposit ETH to WETH
//         const tx = await wethContract.deposit({ value: BigInt(amount) })
//         console.log(`Deposit transaction hash: ${tx.hash}`)

//         const receipt = await tx.wait()
//         console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
//         console.log("Deposit completed successfully")

//         // Send WETH to vault
//         const sendTx = await wethContract.transfer(nailongContractAddress, amount)
//         console.log(`Send transaction hash: ${sendTx.hash}`)

//         const sendReceipt = await sendTx.wait()
//         console.log(`Transaction confirmed in block ${sendReceipt.blockNumber}`)
//         console.log("Send completed successfully")

//         // Deposit from the vault 
//         const nailongContract = new ethers.Contract(nailongContractAddress, nailongAbi, wallet)
//         const depositTx = await nailongContract.executeToVault(BigInt(amount))
//         console.log(`Deposit transaction hash: ${depositTx.hash}`)

//         const depositReceipt = await depositTx.wait()
//         console.log(`Transaction confirmed in block ${depositReceipt.blockNumber}`)
//         console.log("Deposit completed successfully")

//     } catch (error) {
//         console.error("Error depositing to vault:", error)
//     }
// }

// Uncomment to test deposit functionality
// depositToVault(1000000000000000000)