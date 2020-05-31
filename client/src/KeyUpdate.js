import React, { useState, useEffect } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

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

const KeyUpdate = (props) => {
    const classes = useStyles();

    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ key, setKey ] = useState("");

    useEffect(() => {
        document.title = "NIDChain审计公钥更新";
    }, []);

    const handleSubmit = async (event) => {
        try{
            const tx = await contract.methods.updateAuditKey(key).send({ 
                from: accounts[0] 
            });
            alert('Successfully submit!');
            window.location.reload();
        } catch (error) {
            console.error(error);
        } 
    }

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    });

    return (
        <div className="main-container">
            <h2>审计公钥更新</h2>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="新审计公钥"
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

export default KeyUpdate;
