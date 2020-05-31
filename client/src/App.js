import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import getWeb3 from "./getWeb3";

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import NIDAdminContract from "./contracts/NIDAdmin.json";

import Home from "./Home";
import Review from "./Review";
import Request from "./Request";
import Trace from "./Trace";
import KeyUpdate from "./KeyUpdate";

import "./App.css";

const App = () => {
    const [state, setState] = useState({ 
        web3: null, 
        accounts: null, 
        contract: null 
    });

    useEffect(() => {
        let init = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = NIDAdminContract.networks[networkId];
            const instance = new web3.eth.Contract(
                NIDAdminContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            setState({ web3, accounts, contract: instance});
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
        };
        init();
    }, []);

    const useStyles = makeStyles({
        root: {
            flexGrow: 1,
        },
    });

    const classes = useStyles();

    if (!state.web3) {
        return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
        <Router>
        <div>
            <AppBar position="static" color="default">
                <Toolbar>
                    <NavLink className={"nav-link"} to="/">组织查询</NavLink>
                    <NavLink className={"nav-link"} to="/request/">组织变更</NavLink>
                    <NavLink className={"nav-link"} to="/review/">组织变更审批</NavLink>
                    <NavLink className={"nav-link"} to="/trace/">用户身份溯源</NavLink>
                    <NavLink className={"nav-link"} to="/key/">审计公钥更新</NavLink>
                </Toolbar>
            </AppBar>

            <Route path="/" exact render={(props) => <Home {...props} eth={state} />}/>
            <Route path="/request/" exact render={(props) => <Request {...props} eth={state} />}/>
            <Route path="/review/" exact render={(props) => <Review {...props} eth={state} />}/>
            <Route path="/trace/" exact render={(props) => <Trace {...props} eth={state} />}/>
            <Route path="/key/" exact render={(props) => <KeyUpdate {...props} eth={state} />}/>
        </div>
        </Router>
    );
}

export default App;
