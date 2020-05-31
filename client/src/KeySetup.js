import React, { useState, useEffect } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import { sizing } from '@material-ui/system';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(0.5),
    },
    button: {
        margin: theme.spacing(2),
    },
  }));

const KeySetup = (props) => {
    const classes = useStyles();

    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ key, setKey ] = useState("");
    const [ auditKeySet, setAuditKeySet ] = useState(false);

    const init = async () => {
        const auditKeySet = await contract.methods.auditKeySet().call();
        setAuditKeySet(auditKeySet);
    }

    useEffect(() => {
        document.title = "NIDChain审计公钥设置";
        init(); 
    }, []);

    const handleSubmit = async (event) => {
        try{
            const tx = await contract.methods.setAuditKey(key).send({ 
                from: accounts[0] 
            });
            alert('Successfully submit!');
            window.location.reload();
        } catch (error) {
            console.error(error);
        } 
    }

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
    });

    if (auditKeySet) {
        return (
            <div className="main-container">
                <h2>审计公钥已完成设置！</h2>
            </div>
        );
    } else {
        return (
            <div className="main-container">
                <h2>审计公钥设置</h2>
                <h3>仅可设置一次，请谨慎填写！</h3>
                <FormControl className={classes.formControl}>
                <TextField 
                    required
                    label="审计公钥（十六进制表示）"
                    value={key} 
                    onChange={(e) => {setKey(e.target.value)}}
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
        );
    }
}

export default KeySetup;
