pragma solidity >0.4.23 <0.7.0;

import "./NIDOrganization.sol";

contract NIDAdmin {
    NIDOrganization[] private _organizations;

    event OrganizationCreated(uint256 indexed index, string indexed name, uint256 timestamp);

    constructor() public {

    }

    function createNIDOrganization(string memory _name) public {
        NIDOrganization org = new NIDOrganization(
            _name,
            msg.sender
        );
        _organizations.push(org);
        emit OrganizationCreated(_organizations.length - 1, _name, block.timestamp);
    }

    function getOrganizationCount() view public returns(uint256) {
        return _organizations.length;
    }
}