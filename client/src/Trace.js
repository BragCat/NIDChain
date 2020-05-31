import React, { useState, useEffect } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

import EthCrypto from 'eth-crypto';

import NIDOrgContract from "./contracts/NIDOrg.json";

import { TIME_INTERVAL } from './Utils';
import { getBinaryIPv6, getInterface, getNIDFromInterface, getTimeFromInterface, decryptByIDEA } from "./Utils";
import { ideaEncrypt, ideaDecrypt } from "./IDEA";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(2),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(2),
        marginLeft: 0
    },
  }));

const Trace = (props) => {

    const test = async() => {
        // IDEA algorithm test
        const key = "00010010001101000101011001111000100100001010101100110100010101100101011001111000001000110100010100011001000010000001001000110101";
        const data = "0001001000110100010101100111100010011000011101100101010000110010";
        
        const cipher = ideaEncrypt(data, key);
        const plain = ideaDecrypt(cipher, key);
        
        console.log("IDEA original text: " + data);
        console.log("IDEA decrypted text: " + plain);
        console.assert(plain === data, 
            "The text decrypted from IDEA cipher doesn't match the original text!");

        // ECC algorithm test
        const admin = EthCrypto.createIdentity();
        console.log("ECC public key: " + admin.publicKey);
        console.log("ECC private key: " + admin.privateKey);

        // Encryption
        const encryptedKey = await EthCrypto.encryptWithPublicKey(
            admin.publicKey,
            JSON.stringify(key)
        );
        const encryptedString = EthCrypto.cipher.stringify(encryptedKey);
        console.log("ECC encrypted text: " + encryptedString);
        
        // Decryption
        const encryptedObject = EthCrypto.cipher.parse(encryptedString);
        const decryptedKey = await EthCrypto.decryptWithPrivateKey(
            admin.privateKey,
            encryptedObject 
        );
        const actualKey = JSON.parse(decryptedKey);
        console.log("ECC original text: " + key);
        console.log("ECC decrypted text: " + actualKey);
        console.assert(actualKey === key, 
            "The text decrypted from ECC cipher doesn't match the original text!");
    }
    //test();

    const classes = useStyles();

    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const adminContract = props.eth.contract;

    const [ ipv6, setIPv6 ] = useState("");
    const [ nid, setNID ] = useState("");
    const [ privateKey, setPrivateKey ] = useState("");

    useEffect(() => {
        document.title = "NIDChain用户溯源";
    }, []);

    const prefixMatched = (ipv6, prefix) => {
        const binaryIPv6 = getBinaryIPv6(ipv6);
        const binaryPrefix = getBinaryIPv6(prefix);
        for (let i = 0; i < 64; ++i) {
            if (binaryIPv6[i] !== binaryPrefix[i]) {
                return false;
            }
        }
        return true;
    }

    const handleSubmit = async (event) => {
        try{
            const encryptedMsg = getInterface(ipv6);
            const orgs = await adminContract.methods.orgQuery().call();
            const orgCnt = await adminContract.methods.orgCount().call();
            let index = -1; 
            for (let i = 0; i < orgCnt; ++i) {
                const contract = new web3.eth.Contract(
                    NIDOrgContract.abi,
                    orgs[i]
                );
                const pool = await contract.methods.pool().call();
                if (prefixMatched(ipv6, pool)) {
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                alert("This IPv6 address does not belong to these organizations!");
                return;
            } 
            const orgContract = new web3.eth.Contract(
                NIDOrgContract.abi,
                orgs[index]
            );
            let keyCnt = await orgContract.methods.getKeyHistoryCount().call();
            for (let i = keyCnt - 1; i >= 0; --i) {
                let keyLife = await orgContract.methods.getNewestKeyLifeByIndex(i).call();
                let encryptedString = keyLife.key;
                console.log("Encrypted IDEA key: " + encryptedString);
                const encryptedObject = EthCrypto.cipher.parse(encryptedString);
                const decryptedKey = await EthCrypto.decryptWithPrivateKey(
                    privateKey,
                    encryptedObject 
                );
                const key = JSON.parse(decryptedKey);
                let effectTime = keyLife.effectTime;
                let expireTime = keyLife.expireTime;
                let decryptedMsg = ideaDecrypt(encryptedMsg, key);
                let nid = getNIDFromInterface(decryptedMsg);
                console.log("Key: " + key);
                console.log("NID: " + nid);
                let time = getTimeFromInterface(decryptedMsg);
                console.log("Time: " + time);
                if (time >= effectTime && time <= expireTime + TIME_INTERVAL) {
                    setNID(nid);
                    break;
                }
            }
        } catch (error) {
            console.error(error);
        } 
    }

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
    });

    return (
        <div className="main-container">
            <h2>用户身份溯源</h2>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="NIDTGA地址"
                value={ipv6} 
                onChange={(e) => {setIPv6(e.target.value)}}
            >
            </TextField>
            <TextField 
                required
                label="审计私钥"
                value={privateKey} 
                onChange={(e) => {setPrivateKey(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <Button 
                className={classes.button}
                onClick={handleSubmit} 
                variant="contained"
                color="primary"
            >
                提交
            </Button>
            </div>
            <div>
                <p>用户NID: {nid}</p>
            </div>
        </div>
    );
}

export default Trace;
