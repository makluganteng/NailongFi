// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NailongMain} from "../src/NailongMain.sol";

contract DeployNailongMainScript is Script {
    // Katana chain RPC: https://rpc.tatara.katanarpc.com/

    // You'll need to set these addresses for your deployment
    address constant BRIDGE_ADDRESS =
        0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582; // TODO: Set actual bridge address
    address constant VAULT_ADDRESS = 0xccC0Fc2E34428120f985b460b487eB79E3C6FA57; // From your contract comment
    address constant WETH_ADDRESS = 0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Deploying NailongMain to Katana Chain ===");
        console.log("Deployer:", deployer);
        console.log("Bridge Address:", BRIDGE_ADDRESS);
        console.log("Vault Address:", VAULT_ADDRESS);
        console.log("WETH Address:", WETH_ADDRESS);
        console.log("Network:", vm.toString(block.chainid));

        vm.startBroadcast(deployerPrivateKey);

        // Deploy NailongMain contract
        NailongMain nailongMain = new NailongMain(
            BRIDGE_ADDRESS,
            VAULT_ADDRESS,
            WETH_ADDRESS
        );

        vm.stopBroadcast();

        console.log("NailongMain deployed successfully!");
        console.log("Contract Address:", address(nailongMain));

        // Verify deployment by calling a view function
        console.log("\n=== Verification ===");
        console.log("Checking deployer balance...");
        uint256 deployerBalance = nailongMain.checkBalance(deployer);
        console.log("Deployer balance:", deployerBalance);

        console.log("\n=== Deployment Summary ===");
        console.log("Contract: NailongMain");
        console.log("Address:", address(nailongMain));
        console.log("Bridge:", BRIDGE_ADDRESS);
        console.log("Vault:", VAULT_ADDRESS);
        console.log("Deployer:", deployer);
        console.log("Chain ID:", vm.toString(block.chainid));
    }
}
