import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import OrgCard from './OrgCard';

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    input: {
        display: 'none',
    },
}));


const Home = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract; 

    const [orgs, setOrgs] = useState([]);

    const classes = useStyles();

    const init = async () => {
        try {
            const orgs = await contract.methods.orgQuery().call();
            console.log(orgs);
            setOrgs(orgs);
        } catch (error) {
            alert("Call contract orgQuery failed!");
            console.log(error);
        }
    };
    
    useEffect(() => {
        document.title = "NIDChain组织查询";
        init();
    }, [])

    window.ethereum.on("accountsChanged", function (accounts) {
        window.location.reload();
    });

    const displayOrgs = () => {
        return orgs.map((org) => {
            return (<OrgCard
                eth = {props.eth}
                org = {org}
                key = {org}
            />
            );
        });
    };

    return (
        <div className="main-container">
            {displayOrgs()}
        </div>
    );
}

export default Home;
