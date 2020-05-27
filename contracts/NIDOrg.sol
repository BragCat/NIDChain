pragma solidity >0.4.23 <0.7.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract NIDOrg is Ownable {
    bytes20 public id;
    string public name;
    string public admin;
    string public phone;
    string public mail;

    // history of organization's IDEA key used for encrypting NID and timestamp into IPv6 address
    struct KeyLife {
        string key;
        uint256 timestamp;
    }
    KeyLife[] private _keyHistory;

    event KeyUpdated(uint256 indexed index, string key, uint256 timestamp);

    constructor(
        address _owner,
        bytes20 _id,
        string memory _name,
        string memory _admin,
        string memory _phone,
        string memory _mail
    ) public {
        _transferOwnership(_owner);
        id = _id;
        name = _name;
        admin = _admin;
        phone = _phone;
        mail = _mail;
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
        emit KeyUpdated(_keyHistory.length, newKeyLife.key, newKeyLife.timestamp);
    }
}
