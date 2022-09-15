// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Faucet {
  modifier limitWithdraw(uint256 withdrawAmount) {
    require(
      withdrawAmount <= 100000000000000000,
      "Cannot withdraw less than 0.1 eth"
    );
    _;
  }

  function addFunds() external payable {}

  function withdraw(uint256 withdrawAmount) external {
    payable(msg.sender).transfer(withdrawAmount);
  }
}
