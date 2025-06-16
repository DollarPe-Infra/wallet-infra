// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAutoForwardWallet {
    function initialize(address _forwardAddress, address _factory) external;
    function flush() external;
}

contract CloneFactory is Ownable {
    using Clones for address;

    address public implementation;
    address public forwardAddress;

    mapping(address => bool) public isClone;

    event CloneCreated(address indexed clone);
    event ForwardAddressUpdated(address indexed newAddress);
    event ImplementationUpdated(address indexed newImpl);

    constructor(
        address _implementation,
        address _forwardAddress
    ) Ownable(msg.sender) {
        require(_implementation != address(0), "Invalid implementation");
        require(_forwardAddress != address(0), "Invalid forward address");

        implementation = _implementation;
        forwardAddress = _forwardAddress;
    }

    function createClones(
        uint256 count
    ) external onlyOwner returns (address[] memory clones) {
        require(
            count > 0 && count <= 50,
            "Batch size must be between 1 and 50"
        );
        clones = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            address clone = implementation.clone();
            IAutoForwardWallet(clone).initialize(forwardAddress, address(this));
            isClone[clone] = true;
            emit CloneCreated(clone);
            clones[i] = clone;
        }
    }

    function flush(address[] calldata wallets) external onlyOwner {
        require(
            wallets.length > 0 && wallets.length <= 50,
            "Batch size must be between 1 and 50"
        );
        for (uint256 i = 0; i < wallets.length; i++) {
            if (isClone[wallets[i]]) {
                IAutoForwardWallet(wallets[i]).flush();
            }
        }
    }

    function updateForwardAddress(address newForward) external onlyOwner {
        require(newForward != address(0), "Invalid address");
        forwardAddress = newForward;
        emit ForwardAddressUpdated(newForward);
    }

    function updateImplementation(address newImpl) external onlyOwner {
        require(newImpl != address(0), "Invalid address");
        implementation = newImpl;
        emit ImplementationUpdated(newImpl);
    }
}
