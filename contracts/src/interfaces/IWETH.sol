// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.20;

import {IERC20} from "./IERC20.sol";

/**
 * @dev Define interface for WETH (Wrapped Ether)
 */
interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}
