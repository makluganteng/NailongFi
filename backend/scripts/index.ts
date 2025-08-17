import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const ABI = [
    "function claimAndRedeem(bytes32[32],bytes32[32],uint256,bytes32,bytes32,address,uint256,address,bytes)"
]

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL as string);
const wallet = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY as string, provider);

const contract = new ethers.Contract(process.env.BANK_CONTRACT_ADDRESS as string, ABI, wallet);

const executeClaimAndRedeem = async () => {
    const result = await fetch("https://rpc-bridge-tatara-s4atxtv7sq.t.conduit.xyz/merkle-proof?deposit_cnt=53&net_id=29")
    const data = await result.json();
    console.log(data);
    // console.log(data);
    const balance = await contract.claimAndRedeem(
        data.proof.merkle_proof,
        data.proof.rollup_merkle_proof,
        120259084341,
        "0x01a95cb3c14165578eee85ac3c7316a6737b87d155ce59383f9fad4c0018ccb4",
        "0xab5c1030f81eec2ff5b30d2e823a2121c6aa57a1a1e8246706992b6aad1a9fa0",
        wallet.address,
        BigInt(10000000000000000),
        "0xcA51855FBA4aAe768DCc273349995DE391731e70",
        "0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a5661756c7420427269646765205772617070656420457468657200000000000000000000000000000000000000000000000000000000000000000000000000045745544800000000000000000000000000000000000000000000000000000000"
    );
    console.log(balance);
}

executeClaimAndRedeem();

