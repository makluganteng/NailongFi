// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.20;

/**
 * @dev Define interface for Yearn Vault
 */
interface IYearnVault {
    function deposit(
        uint256 assets,
        address receiver
    ) external returns (uint256 shares);

    function withdraw(
        uint256 shares,
        address receiver,
        address owner
    ) external returns (uint256 assets);

    function balanceOf(address account) external view returns (uint256);

    function token() external view returns (address);
}
