import React, { useState, useEffect } from "react";

import getWeb3 from "./getWeb3";
import NIDAdminContract from "./contracts/NIDAdmin";

const Home = () => {
    const [ web3, setWeb3 ] = useState(null);
    const [ accounts, setAccounts ] = useState(null);
    const [ contract, setContract ] = useState(null);
    const [ organizations, setOrganizations ] = useState(null);
    const [ applications, setApplications ] = useState(null);

    /*
    useEffect(() => {
        init();
    }, []);
     */

    const init = async () => {
        try {
            const web3 = await getWeb3();
            const networkId = await web3.eth.net.getId();
            const accounts = await web3.eth.getAccounts();
            const deployedNetwork = NIDAdminContract.networks[networkId];
            const instance = new web3.eth.Contract(
                NIDAdminContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            setWeb3(web3);
            setAccounts(accounts);
            setContract(instance);

            //const organizations = await instance.methods.organizations(10, 0).call();
            //const applications = await instance.methods.applications(10, 0).call();
            //setOrganizations(organizations);
            //setApplications(applications);
        } catch(error) {
            alert('Failed to load web3, accounts, or contract. Check console for details.');
            console.error(error);
        }
    };

    init();
    console.log(contract);

    return (
        <div><h2>Home</h2></div>
    );
};

export default Home;