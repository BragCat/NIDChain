import React, { useState, useEffect } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

import NIDOrgContract from "./contracts/NIDOrg.json";

import { TIME_INTERVAL } from './Utils';
import { getInterface, getNIDFromInterface, getTimeFromInterface, decryptByIDEA } from "./Utils";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(2),
    },
  }));

const Trace = (props) => {
    const classes = useStyles();

    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const adminContract = props.eth.contract;

    const [ ipv6, setIPv6 ] = useState("");
    const [ nid, setNID ] = useState("");
    const [ pool, setPool ] = useState("");

    useEffect(() => {
        document.title = "NIDChain用户溯源";
    }, []);

    const prefixMatched = (ipv6, prefix) => {
        let n = prefix.length;
        for (let i = 0; i < n - 2; ++i) {
            if (ipv6[i] !== prefix[i]) {
                return false;
            }
        }
        return true;
    }


    const handleSubmit = async (event) => {
        try{
            const encryptedMsg = getInterface(ipv6);
            console.log(encryptedMsg);
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
                let key = keyLife.key;
                let effectTime = keyLife.effectTime;
                let expireTime = keyLife.expireTime;
                let decryptedMsg = decryptByIDEA(encryptedMsg, key);
                let nid = getNIDFromInterface(decryptedMsg);
                console.log("Key " + key + ", NID: " + nid);
                let time = getTimeFromInterface(decryptedMsg);
                console.log("Key " + key + ", Time: " + time);
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
            </FormControl>
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
