import React, { useState, useEffect } from "react";
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import getWeb3 from "./getWeb3";
import NIDAdminContract from "./contracts/NIDAdmin";
import Web3 from 'web3'

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
    dense: {
        marginTop: theme.spacing(2),
    },
    menu: {
        width: 200,
    },
}));


const NewApplication = () => {
    const [ web3, setWeb3 ] = useState(null);
    const [ accounts, setAccounts ] = useState(null);
    const [ contract, setContract ] = useState(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            console.log(accounts[0]);
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = NIDAdminContract.networks[networkId];
            const instance = new web3.eth.Contract(
                NIDAdminContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            setWeb3(web3);
            setAccounts(accounts);
            setContract(instance);
        } catch (error) {
            alert('Failed to load web3, accounts, or contract.' +
                'Check console for details.');
            console.error(error);
        }
    };

    const classes = useStyles();

    const [ name, setOrganizationName ] = useState(null);

    const handleSubmit = async () => {
        const transaction = await contract.methods.applyNIDOrganization(
            name,
        ).send({ from: accounts[0] });

        alert('Successfully applied a new organization');
    };

    return (
        <div>
            <h2>Create A Organization</h2>

            <label>Name</label>
            <TextField
                id="outlined-bare"
                className={classes.textField}
                placeholder="Organization Name"
                margin="normal"
                onChange={(e) => setOrganizationName(e.target.value)}
                variant="outlined"
                inputProps={{ 'aria-label': 'bare' }}
            />

            <Button
                onClick={handleSubmit}
                variant="contained"
                className={classes.button}>
                Submit
            </Button>
        </div>
    )
};

export default NewApplication;