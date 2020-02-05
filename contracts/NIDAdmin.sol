pragma solidity >0.4.23 <0.7.0;

import "./NIDOrganization.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract NIDAdmin is Ownable {
    NIDOrganization[] private _applications;
    NIDOrganization[] private _organizations;

    event OrganizationApplied(uint256 indexed index, string indexed name, uint256 timestamp);
    event OrganizationDeleted(uint256 indexed index, string indexed name, uint256 timestamp);
    event ApplicationApproved(uint256 indexed index, string indexed name, uint256 timestamp);
    event ApplicationRejected(uint256 indexed index, string indexed name, uint256 timestamp);

    constructor() public {

    }

    // used for each NID organization admin to apply for a new organization's joining
    function applyNIDOrganization(string memory _name) public {
        NIDOrganization org = new NIDOrganization(
            _name,
            msg.sender
        );
        _applications.push(org);
        emit OrganizationApplied(_applications.length - 1, _name, block.timestamp);
    }

    // used for NID system admin to approve organization application
    function approveNIDOrganizationApplication(uint256 index) public onlyOwner {
        require(index < _applications.length);
        NIDOrganization org = _applications[index];
        _organizations.push(org);
        removeApplication(index);
        emit ApplicationApproved(index, org.name(), block.timestamp);
    }

    // used for NID system admin to reject organization application
    function rejectNIDOrganizationApplication(uint256 index) public onlyOwner {
        require(index < _applications.length);
        string memory name = _applications[index].name();
        removeApplication(index);
        emit ApplicationRejected(index, name, block.timestamp);
    }

    // used for NID system admin to delete obsolete organizations
    function deleteNIDOrganization(uint256 index) public onlyOwner{
        require(index < _organizations.length);
        string memory name = _applications[index].name();
        removeOrganization(index);
        emit OrganizationDeleted(index, name, block.timestamp);
    }

    function getApplicationCount() view public returns(uint256) {
        return _applications.length;
    }

    function getOrganizationCount() view public returns(uint256) {
        return _organizations.length;
    }

    function removeApplication(uint256 index) private {
        for (uint256 i = index; i < _applications.length - 1; ++i) {
            _applications[i] = _applications[i + 1];
        }
        delete _applications[_applications.length - 1];
        --_applications.length;
    }

    function removeOrganization(uint256 index) private {
        for (uint256 i = index; i < _organizations.length - 1; ++i) {
            _organizations[i] = _organizations[i + 1];
        }
        delete _organizations[_organizations.length - 1];
        --_organizations.length;
    }
}