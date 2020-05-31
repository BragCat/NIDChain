pragma solidity >=0.4.21 <0.7.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./NIDOrg.sol";


contract NIDAdmin is Ownable {

    struct OrgRequest {
        address owner;
        bytes20 id;
        uint256 reqType;
        string name;
        string admin;
        string phone;
        string mail;
        string nidAddr;
        uint256 nidPort;
        string pool;
    }

    string public auditKey;
    bool public auditKeySet;

    OrgRequest[] private _reqs;
    NIDOrg[] private _orgs;

    // events
    event OrgRequestSubmitted(uint256 indexed reqType, string indexed orgName, address indexed account);
    event OrgRequestApproved(uint256 indexed reqType, string indexed orgName, address indexed account);
    event OrgRequestRejected(uint256 indexed reqType, string indexed orgName, address indexed account);
    event OrgCreated(NIDOrg indexed org, address indexed account);
    event OrgUpdated(NIDOrg indexed org, address indexed account);
    event OrgDeleted(NIDOrg indexed org, address indexed account);
    event AuditKeyUpdated(string indexed key, address indexed account);

    constructor() public {
        _transferOwnership(msg.sender);
        auditKeySet = false;
    }

    function toBytes(address x) public pure returns (bytes20) {
        bytes20 b;
        for (uint i = 0; i < 20; i++) {
            b |= bytes20(byte(uint8(uint256(x) / (2 ** (8 * (19 - i))))) & 0xFF) >> (i * 8);
        }
        return b;
    }

    function createOrgRequest(
        uint256 _reqType,
        string memory _name,
        string memory _admin,
        string memory _phone,
        string memory _mail,
        string memory _nidAddr,
        uint256 _nidPort,
        string memory _pool
    )
        public
    {
        bytes20 id = toBytes(msg.sender); OrgRequest memory req = OrgRequest( msg.sender,
            id,
            _reqType,
            _name,
            _admin,
            _phone,
            _mail,
            _nidAddr,
            _nidPort,
            _pool
        );
        bool applied = false;
        for (uint256 i = 0; i < _reqs.length; ++i) {
            if (_reqs[i].id == id) {
                _reqs[i] = req;
                applied = true;
                break;
            }
        }
        if (!applied) {
            _reqs.push(req);
        }
        emit OrgRequestSubmitted(_reqType, _name, msg.sender);
    }

    function requestDetailQuery(bytes20 id) public view returns (
        uint256 reqType,
        string memory name,
        string memory admin,
        string memory phone,
        string memory mail,
        string memory nidAddr,
        uint256 nidPort,
        string memory pool
    ) {
        for (uint256 i = 0; i < _reqs.length; ++i) {
            if (_reqs[i].id == id) {
                return (
                    _reqs[i].reqType,
                    _reqs[i].name,
                    _reqs[i].admin,
                    _reqs[i].phone,
                    _reqs[i].mail,
                    _reqs[i].nidAddr,
                    _reqs[i].nidPort,
                    _reqs[i].pool
                );
            }
        }
        assert(false);
    }

    function requestIdsQuery() public view returns (bytes20[] memory ids) {
        ids = new bytes20[](_reqs.length);
        for (uint256 i = 0; i < _reqs.length; ++i) {
            ids[i] = _reqs[i].id;
        }
        return ids;
    }

    function requestCount() public view returns (uint256) {
        return _reqs.length;
    }

    function orgQuery() public view returns (NIDOrg[] memory) {
        return _orgs;
    }

    function orgCount() public view returns (uint256) {
        return _orgs.length;
    }

    function findIndexFromReqs(bytes20 id) private view returns (uint256){
        for (uint256 i = 0; i < _reqs.length; ++i) {
            if (_reqs[i].id == id) {
                return i;
            }
        }
        assert(false);
    }

    function removeFromReqs(uint256 index) private {
        for (uint256 i = index; i + 1 < _reqs.length; ++i) {
            _reqs[i] = _reqs[i + 1];
        }
        _reqs.pop();
    }

    function findIndexFromOrgs(bytes20 id) private view returns (uint256){
        for (uint256 i = 0; i < _orgs.length; ++i) {
            if (_orgs[i].id() == id) {
                return i;
            }
        }
        assert(false);
    }

    function removeFromOrgs(uint256 index) private {
        for (uint256 i = index; i + 1 < _orgs.length; ++i) {
            _orgs[i] = _orgs[i + 1];
        }
        _orgs.pop();
    }

    function requestApprove(bytes20 id) public onlyOwner {
        uint256 index = findIndexFromReqs(id);
        OrgRequest memory req = _reqs[index];
        removeFromReqs(index);
        if (req.reqType == 0) {
            NIDOrg org = new NIDOrg(
                req.owner,
                req.id,
                req.name,
                req.admin,
                req.phone,
                req.mail,
                req.nidAddr,
                req.nidPort,
                req.pool
            );
            _orgs.push(org);
            emit OrgCreated(org, req.owner);
        } else if (req.reqType == 1) {
            index = findIndexFromOrgs(req.id);
            _orgs[index].updateOrg(
                req.owner,
                req.id,
                req.name,
                req.admin,
                req.phone,
                req.mail,
                req.nidAddr,
                req.nidPort,
                req.pool
            );
            emit OrgUpdated(_orgs[index], req.owner);
        } else {
            index = findIndexFromOrgs(req.id);
            NIDOrg org = _orgs[index];
            removeFromOrgs(index);
            emit OrgDeleted(org, req.owner);
        }
        emit OrgRequestApproved(req.reqType, req.name, req.owner);
    }

    function requestReject(bytes20 id) public onlyOwner {
        uint256 index = findIndexFromReqs(id);
        OrgRequest memory req = _reqs[index];
        removeFromReqs(index);
        emit OrgRequestRejected(req.reqType, req.name, req.owner);
    }

    function setAuditKey(string memory key) public onlyOwner {
        require(!auditKeySet, "The audit key has already been set.");
        auditKey = key;
        auditKeySet = true;
        emit AuditKeyUpdated(key, msg.sender);
    }
}
