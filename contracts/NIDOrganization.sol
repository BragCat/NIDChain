pragma experimental ABIEncoderV2;

pragma solidity >0.4.23 <0.7.0;

contract NIDOrganization {
    // organization's name, example: Tsinghua University
    string public name;

    // history of organization's IDEA key used for encrypting NID and timestamp into IPv6 address
    struct KeyLife {
        string key;
        uint256 timestamp;
    }
    KeyLife[] private _keyHistory;

    event KeyUpdated(uint256 indexed index, string key, uint256 timestamp);

    constructor(string memory _name) public {
        name = _name;
    }

    function getNewestKey() view public returns(string memory) {
        return _keyHistory[_keyHistory.length - 1].key;
    }

    function updateKey(string memory newKey) public {
        KeyLife memory newKeyLife = KeyLife({
            key: newKey,
            timestamp: block.timestamp
            });
        _keyHistory.push(newKeyLife);
        emit KeyUpdated(_keyHistory.length, newKeyLife.key, newKeyLife.timestamp);
    }

    function getKeyHistory() view public returns(KeyLife[] memory keyHistory) {
       /* TODO: replace the current implementation with this block and serialize the array into one string to return
        uint256 count = _keyHistory.length;
        keys = new string[](count);
        timestamps = new uint256[](count);
        for (uint256 i = 0; i < count; ++i) {
            keys.push(_keyHistory[i].key);
            timestamps.push(_keyHistory[i].timestamp);
        }
        return (keys, timestamps);*/
        return _keyHistory;
    }

}