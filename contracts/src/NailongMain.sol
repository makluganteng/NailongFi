// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IBridge} from "./interfaces/IBridge.sol";
import {IYearnVault} from "./interfaces/IYearnVault.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IWETH} from "./interfaces/IWETH.sol";

contract NailongMain {
    struct Deposit {
        address user;
        uint256 amount;
        uint256 nonce;
        uint256 timestamp;
    }

    event ExecutedToVault(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp
    );

    event RequestWithdraw(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp
    );

    event Deposited(
        address indexed user,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp
    );

    error InsufficientBalance();
    error NotAdmin();

    mapping(address => uint256) public balances;
    address public BRIDGE_ADDRESS; //
    address public VAULT_ADDRESS; //
    address public WETH_ADDRESS;
    address public ADMIN_ADDRESS;

    modifier onlyAdmin() {
        if (msg.sender != ADMIN_ADDRESS) {
            revert NotAdmin();
        }
        _;
    }

    constructor(
        address _bridgeAddress,
        address _vaultAddress,
        address _wethAddress
    ) {
        BRIDGE_ADDRESS = _bridgeAddress;
        VAULT_ADDRESS = _vaultAddress;
        WETH_ADDRESS = _wethAddress;
        ADMIN_ADDRESS = msg.sender;
    }

    function executeToVault(uint256 amount, address user) external onlyAdmin {
        // Check if we have enough WETH balance after wrapping
        if (IWETH(WETH_ADDRESS).balanceOf(address(this)) < amount) {
            revert InsufficientBalance();
        }

        // Then approve the vault to spend our WETH
        IWETH(WETH_ADDRESS).approve(VAULT_ADDRESS, amount);

        // Deposit to vault - the vault will transfer WETH from this contract
        IYearnVault(VAULT_ADDRESS).deposit(amount, address(this));

        //updates the user's balance
        balances[user] += amount;

        // Emit event
        emit ExecutedToVault(user, amount, 0, block.timestamp);
    }

    /*
     * @notice This will be the function being called by the bridge to withdraw the funds from the Nailong Main contract
     * @param amount The amount of tokens to withdraw
     */
    function requestWithdraw(
        address user,
        uint256 amount,
        uint32 destinationNetwork,
        address destinationAddress,
        address token,
        bool forceUpdateGlobalExitRoot,
        bytes memory permitData
    ) external onlyAdmin {
        // withdraw from vault
        IYearnVault(VAULT_ADDRESS).withdraw(
            amount,
            address(this),
            address(this)
        );

        IBridge(BRIDGE_ADDRESS).bridgeAsset(
            destinationNetwork,
            destinationAddress,
            amount,
            token,
            forceUpdateGlobalExitRoot,
            permitData
        );

        //updates the user's balance
        balances[user] -= amount;

        // emit event
        emit RequestWithdraw(user, amount, 0, block.timestamp);
    }

    function checkBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function getContractBalances()
        external
        view
        returns (uint256 ethBalance, uint256 wethBalance)
    {
        ethBalance = address(this).balance;
        wethBalance = IWETH(WETH_ADDRESS).balanceOf(address(this));
    }

    function wrapEthToWeth() external onlyAdmin {
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            IWETH(WETH_ADDRESS).deposit{value: ethBalance}();
        }
    }

    function setAdmin(address _adminAddress) external onlyAdmin {
        ADMIN_ADDRESS = _adminAddress;
    }

    function setVaultAddress(address _vaultAddress) external onlyAdmin {
        VAULT_ADDRESS = _vaultAddress;
    }

    function setWethAddress(address _wethAddress) external onlyAdmin {
        WETH_ADDRESS = _wethAddress;
    }

    // Allow the contract to receive ETH
    receive() external payable {}
}
