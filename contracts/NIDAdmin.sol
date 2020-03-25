pragma solidity >0.4.23 <0.7.0;

import "./NIDOrganization.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract NIDAdmin is Ownable {
    uint256 constant MAX_LIMIT = 20;
    NIDOrganization[] private _applications;
    NIDOrganization[] private _organizations;

    event ApplicationSubmitted(uint256 indexed index, string indexed name, uint256 timestamp);
    event ApplicationWithdrawn(uint256 indexed index, string indexed name, uint256 timestamp);

    event ApplicationApproved(uint256 indexed index, string indexed name, uint256 timestamp);
    event ApplicationRejected(uint256 indexed index, string indexed name, uint256 timestamp);
    event OrganizationDeleted(uint256 indexed index, string indexed name, uint256 timestamp);

    constructor() public {

    }

    // used for each NID organization admin to apply for a new organization
    function applyNIDOrganization(string memory name) public {
        NIDOrganization org = new NIDOrganization(
            name,
            msg.sender
        );
        _applications.push(org);
        emit ApplicationSubmitted(_applications.length - 1, name, block.timestamp);
    }

    // used for each NID organization admin to withdraw the application for a new organization
    function withdrawNIDOrganizationApplication(uint256 index) public {
        NIDOrganization org = _applications[index];
        require(org.owner() == msg.sender, "Ownable: application withdrawal can only be requested by owner");
        removeApplication(index);
        emit ApplicationWithdrawn(index, org.name(), block.timestamp);
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
        require(index < _applications.length, "out of application range");
        string memory name = _applications[index].name();
        removeApplication(index);
        emit ApplicationRejected(index, name, block.timestamp);
    }

    // used for NID system admin to delete obsolete organizations
    function deleteNIDOrganization(uint256 index) public onlyOwner{
        require(index < _organizations.length, "out of organization range");
        string memory name = _applications[index].name();
        removeOrganization(index);
        emit OrganizationDeleted(index, name, block.timestamp);
    }

    function getApplicationCount() public view returns(uint256) {
        return _applications.length;
    }

    function getOrganizationCount() public view returns(uint256) {
        return _organizations.length;
    }

    /*
    function organizations(uint256 limit, uint256 offset) public view returns(NIDOrganization[] memory orgs) {
        require(offset == 0 || offset < getOrganizationCount(), "offset out of bounds");
        uint256 size = getOrganizationCount() - offset;
        size = size < limit ? size : limit;
        size = size < MAX_LIMIT ? size : MAX_LIMIT;
        orgs = new NIDOrganization[](size);
        for (uint256 i = 0; i < size; ++i) {
            orgs[i] = _organizations[i + offset];
        }
        return orgs;
    }

    function applications(uint256 limit, uint256 offset) public view returns(NIDOrganization[] memory apps) {
        require(offset == 0 || offset < getApplicationCount(), "offset out of bounds");
        uint256 size = getApplicationCount() - offset;
        size = size < limit ? size : limit;
        size = size < MAX_LIMIT ? size : MAX_LIMIT;
        apps = new NIDOrganization[](size);
        for (uint256 i = 0; i < size; ++i) {
            apps[i] = _applications[i + size];
        }
        return apps;
    }
    */

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