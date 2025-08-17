// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.20;

/**
 * @dev Define interface for PolygonZkEVM Bridge message receiver
 */
interface IBridge {
    function bridgeAsset(
        uint32 destinationNetwork,
        address destinationAddress,
        uint256 amount,
        address token,
        bool forceUpdateGlobalExitRoot,
        bytes memory permitData
    ) external payable;

    function bridgeMessage(
        uint32 destinationNetwork,
        address destinationAddress,
        bool forceUpdateGlobalExitRoot,
        bytes memory data
    ) external payable;
}

// (29,0xcA51855FBA4aAe768DCc273349995DE391731e70,10000000000000000,0x0000000000000000000000000000000000000000,true,0x0)
// [{"destinationNetwork": 29,"destinationAddress": "0xcA51855FBA4aAe768DCc273349995DE391731e70","amount": "10000000000000000","token": "0x0000000000000000000000000000000000000000","forceUpdateGlobalExitRoot": true,"data": "0x0"}]
