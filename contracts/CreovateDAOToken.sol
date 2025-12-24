// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreovateDAOToken (CDT)
 * @dev ERC-20 token with governance features for Creovate DAO
 * 
 * Features:
 * - Standard ERC-20 functionality
 * - Minting and burning capabilities
 * - Pausable transfers for emergency situations
 * - Voting/delegation for DAO governance
 * - Permit for gasless approvals
 * - Role-based access control
 */
contract CreovateDAOToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Pausable, 
    AccessControl, 
    ERC20Permit, 
    ERC20Votes,
    ReentrancyGuard 
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Maximum supply cap (optional, set to 0 for unlimited)
    uint256 public immutable maxSupply;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    /**
     * @dev Constructor
     * @param initialSupply Initial token supply (in wei, 18 decimals)
     * @param _maxSupply Maximum supply cap (0 for unlimited)
     * @param admin Address to receive admin role and initial supply
     */
    constructor(
        uint256 initialSupply,
        uint256 _maxSupply,
        address admin
    ) 
        ERC20("Creovate DAO Token", "CDT") 
        ERC20Permit("Creovate DAO Token") 
    {
        require(admin != address(0), "Admin cannot be zero address");
        require(_maxSupply == 0 || initialSupply <= _maxSupply, "Initial supply exceeds max");
        
        maxSupply = _maxSupply;
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        if (initialSupply > 0) {
            _mint(admin, initialSupply);
        }
    }
    
    /**
     * @dev Mint new tokens (only MINTER_ROLE)
     * @param to Recipient address
     * @param amount Amount to mint
     * @param reason Reason for minting (for events/tracking)
     */
    function mint(
        address to, 
        uint256 amount, 
        string calldata reason
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(
            maxSupply == 0 || totalSupply() + amount <= maxSupply,
            "Minting would exceed max supply"
        );
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burn tokens with reason tracking
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burnWithReason(
        uint256 amount, 
        string calldata reason
    ) external nonReentrant {
        _burn(_msgSender(), amount);
        emit TokensBurned(_msgSender(), amount, reason);
    }
    
    /**
     * @dev Pause all token transfers (only PAUSER_ROLE)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only PAUSER_ROLE)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Get current voting power of an account
     */
    function getVotingPower(address account) external view returns (uint256) {
        return getVotes(account);
    }
    
    /**
     * @dev Get voting power at a specific block
     */
    function getVotingPowerAtBlock(
        address account, 
        uint256 blockNumber
    ) external view returns (uint256) {
        return getPastVotes(account, blockNumber);
    }
    
    // Required overrides for multiple inheritance
    
    function _update(
        address from, 
        address to, 
        uint256 value
    ) internal override(ERC20, ERC20Pausable, ERC20Votes) {
        super._update(from, to, value);
    }
    
    function nonces(
        address owner
    ) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
