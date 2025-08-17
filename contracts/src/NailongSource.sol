// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IBridge} from "./interfaces/IBridge.sol";

contract NailongSource {
    struct DepositBridge {
        uint32 destinationNetwork;
        address destinationAddress;
        uint256 amount;
        address token;
        bool forceUpdateGlobalExitRoot;
        bytes data;
    }

    address public immutable BRIDGE_ADDRESS;
    address public owner;

    // Events
    event AssetBridged(
        uint32 indexed destinationNetwork,
        address indexed destinationAddress,
        address indexed token,
        uint256 amount,
        bytes data
    );

    event MessageBridged(
        uint32 indexed destinationNetwork,
        address indexed destinationAddress,
        bytes data
    );

    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    // Errors
    error InvalidBridgeAddress();
    error InvalidDestinationAddress();
    error InvalidAmount();
    error InvalidToken();
    error BridgeCallFailed();
    error Unauthorized();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _bridgeAddress) {
        if (_bridgeAddress == address(0)) revert InvalidBridgeAddress();
        BRIDGE_ADDRESS = _bridgeAddress;
        owner = msg.sender;
        emit OwnerChanged(address(0), msg.sender);
    }

    function changeOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidDestinationAddress();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnerChanged(previousOwner, newOwner);
    }

    function depositBridge(
        DepositBridge memory depositBridgeParams
    ) external payable {
        // Validate input parameters
        if (depositBridgeParams.destinationAddress == address(0))
            revert InvalidDestinationAddress();
        if (depositBridgeParams.amount == 0) revert InvalidAmount();
        if (depositBridgeParams.token == address(0)) revert InvalidToken();

        // 1. Bridge asset to destination network
        try
            IBridge(BRIDGE_ADDRESS).bridgeAsset{value: msg.value}(
                depositBridgeParams.destinationNetwork,
                depositBridgeParams.destinationAddress,
                depositBridgeParams.amount,
                depositBridgeParams.token,
                depositBridgeParams.forceUpdateGlobalExitRoot,
                depositBridgeParams.data
            )
        {
            emit AssetBridged(
                depositBridgeParams.destinationNetwork,
                depositBridgeParams.destinationAddress,
                depositBridgeParams.token,
                depositBridgeParams.amount,
                depositBridgeParams.data
            );
        } catch {
            revert BridgeCallFailed();
        }

        // 2. Bridge message to destination network
        try
            IBridge(BRIDGE_ADDRESS).bridgeMessage{value: 0}(
                depositBridgeParams.destinationNetwork,
                depositBridgeParams.destinationAddress,
                depositBridgeParams.forceUpdateGlobalExitRoot,
                depositBridgeParams.data
            )
        {
            emit MessageBridged(
                depositBridgeParams.destinationNetwork,
                depositBridgeParams.destinationAddress,
                depositBridgeParams.data
            );
        } catch {
            revert BridgeCallFailed();
        }
    }
}
