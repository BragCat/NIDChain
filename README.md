# NIDChain

## Description
Ethereum application for NID(Network IDentity) key management.

## Build and deploy contracts
Use `Ganache` to host the ethereum blockchain. Then execute:
```
truffle compile
truffle migrate --network ${network-name}
```
Refer to `truffle-config.js` for more detail.

## Start React client
```
cd client
npm start
```

## Dependency
- openzeppelin-solidity
```$xslt
npm install openzeppelin-solidity --save
```
