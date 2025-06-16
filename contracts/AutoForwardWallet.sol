// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AutoForwardWallet is Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public forwardAddress;
    address public factory;

    // Arbitrum Mainnet addresses
    address public constant USDT = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    event Flushed(address indexed token, uint256 amount);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    function initialize(
        address _forwardAddress,
        address _factory
    ) external initializer {
        require(_forwardAddress != address(0), "Invalid forward address");
        require(_factory != address(0), "Invalid factory address");

        forwardAddress = _forwardAddress;
        factory = _factory;
    }

    function flush() external onlyFactory nonReentrant {
        uint256 usdtBal = IERC20(USDT).balanceOf(address(this));
        if (usdtBal > 0) {
            IERC20(USDT).safeTransfer(forwardAddress, usdtBal);
            emit Flushed(USDT, usdtBal);
        }

        uint256 usdcBal = IERC20(USDC).balanceOf(address(this));
        if (usdcBal > 0) {
            IERC20(USDC).safeTransfer(forwardAddress, usdcBal);
            emit Flushed(USDC, usdcBal);
        }
    }

    receive() external payable {
        revert("ETH not accepted");
    }

    fallback() external payable {
        revert("ETH not accepted");
    }
}
