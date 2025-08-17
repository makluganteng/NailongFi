// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.20;

/**
 * @dev Define interface for ERC20
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}
