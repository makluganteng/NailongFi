// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";

contract ExecuteEncodedCallScript is Script {
    // Polygon zkEVM Bridge address on Sepolia
    address constant BRIDGE_ADDRESS =
        0x1561e803442faDdD55580632f734fFc2E8Ee9E10;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        bytes
            memory data = hex"000000000000000000000000000000000000000000000000000000000000001d000000000000000000000000ca51855fba4aae768dcc273349995de391731e7000000000000000000000000000000000000000000000000000038d7ea4c680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000001000000000000000000000000";

        IBridge(BRIDGE_ADDRESS).depositBridge{value: 0.01 ether}(
            29,
            0xcA51855FBA4aAe768DCc273349995DE391731e70,
            0.01 ether, //
            0x0000000000000000000000000000000000000000,
            true,
            data
        );

        vm.stopBroadcast();
    }
}
interface IBridge {
    function depositBridge(
        uint32 destinationNetwork,
        address destinationAddress,
        uint256 amount,
        address token,
        bool forceUpdateGlobalExitRoot,
        bytes memory data
    ) external payable;
}
