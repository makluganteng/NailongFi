// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {NailongMain} from "../src/NailongMain.sol";
import {IYearnVault} from "../src/interfaces/IYearnVault.sol";
import {IWETH} from "../src/interfaces/IWETH.sol";

contract NailongMainTest is Test {
    NailongMain public nailongMain;

    // Katana addresses
    address constant BRIDGE_ADDRESS =
        0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582;
    address constant VAULT_ADDRESS = 0xccC0Fc2E34428120f985b460b487eB79E3C6FA57;
    address constant WETH_ADDRESS = 0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4;

    // Test admin
    address admin = address(0x123);

    function setUp() public {
        // Fork Katana mainnet
        vm.createSelectFork("https://rpc.tatara.katanarpc.com/");

        // Deploy NailongMain contract as admin
        vm.prank(admin);
        nailongMain = new NailongMain(
            BRIDGE_ADDRESS,
            VAULT_ADDRESS,
            WETH_ADDRESS
        );

        console.log("=== Test Setup ===");
        console.log("NailongMain deployed at:", address(nailongMain));
        console.log("Admin address:", admin);
        console.log("Vault address:", VAULT_ADDRESS);
        console.log("WETH address:", WETH_ADDRESS);

        deal(address(WETH_ADDRESS), address(nailongMain), 1 ether);
        // deal(address(WETH_ADDRESS), address(admin), 1 ether);
    }

    function test_ContractDeployment() public {
        assertEq(nailongMain.ADMIN_ADDRESS(), admin);
        assertEq(nailongMain.VAULT_ADDRESS(), VAULT_ADDRESS);
        assertEq(nailongMain.WETH_ADDRESS(), WETH_ADDRESS);
        assertEq(nailongMain.BRIDGE_ADDRESS(), BRIDGE_ADDRESS);
    }

    function test_CheckBalances() public {
        (uint256 ethBalance, uint256 wethBalance) = nailongMain
            .getContractBalances();
        console.log("Initial ETH balance:", ethBalance);
        console.log("Initial WETH balance:", wethBalance);

        assertEq(ethBalance, 0);
        assertEq(wethBalance, 0);
    }

    function test_ExecuteToVault() public {
        // First wrap some ETH to WETH
        vm.deal(address(nailongMain), 1 ether);

        vm.startPrank(admin);

        uint256 nailongBalance = IWETH(WETH_ADDRESS).balanceOf(
            address(nailongMain)
        );

        console.log("Nailong balance:", nailongBalance);

        // Try to execute to vault with 0.5 WETH
        uint256 amount = 0.5 ether;

        nailongMain.executeToVault(amount);

        uint256 vaultBalance = IYearnVault(VAULT_ADDRESS).balanceOf(
            address(nailongMain)
        );
        console.log("Vault balance:", vaultBalance);

        vm.stopPrank();

        // nailongMain.executeToVault(amount);

        // // Check balances after
        // (uint256 ethBalanceAfter, uint256 wethBalanceAfter) = nailongMain
        //     .getContractBalances();
        // console.log(
        //     "After executeToVault - ETH:",
        //     ethBalanceAfter,
        //     "WETH:",
        //     wethBalanceAfter
        // );

        // // Check allowance after
        // uint256 allowanceAfter = nailongMain.getWethAllowance();
        // console.log("WETH allowance after:", allowanceAfter);
    }
}
