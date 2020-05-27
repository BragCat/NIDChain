pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract NIDOrg is Ownable {
    bytes20 public id;
    string public name;
    string public admin;
    string public phone;
    string public mail;
    string public nidAddr;
    uint256 public nidPort;
    string public pool;

    // history of organization's IDEA key used for encrypting NID and timestamp into IPv6 address
    struct KeyLife {
        string key;
        uint256 timestamp;
    }
    KeyLife[] private _keyHistory;

    event KeyUpdated(string key, uint256 timestamp);

    constructor(
        address _owner,
        bytes20 _id,
        string memory _name,
        string memory _admin,
        string memory _phone,
        string memory _mail,
        string memory _nidAddr,
        uint256 _nidPort,
        string memory _pool
    ) public {
        updateOrg(_owner, _id, _name, _admin, _phone, _mail, _nidAddr, _nidPort, _pool);
    }

    function updateOrg(
        address _owner,
        bytes20 _id,
        string memory _name,
        string memory _admin,
        string memory _phone,
        string memory _mail,
        string memory _nidAddr,
        uint256 _nidPort,
        string memory _pool
    ) public {
        _transferOwnership(_owner);
        id = _id;
        name = _name;
        admin = _admin;
        phone = _phone;
        mail = _mail;
        nidAddr = _nidAddr;
        nidPort = _nidPort;
        pool = _pool;
    }

    function getKeyHistoryCount() public view returns(uint256 count) {
        return _keyHistory.length;
    }

    function getNewestKeyLifeByIndex(uint256 index) public view returns(
        string memory key,
        uint256 effectTime,
        uint256 expireTime
    ) {
        require(index < _keyHistory.length, "The index exceeds the range.");
        effectTime = _keyHistory[index].timestamp;
        expireTime = index + 1 == _keyHistory.length ?
            0 :
            _keyHistory[index + 1].timestamp;
        return (_keyHistory[index].key, effectTime, expireTime);
    }

    function updateKey(string memory newKey, uint256 effectTime) public onlyOwner {
        KeyLife memory newKeyLife = KeyLife({
            key: newKey,
            timestamp: effectTime
        });
        _keyHistory.push(newKeyLife);
        emit KeyUpdated(newKeyLife.key, newKeyLife.timestamp);
    }
}
