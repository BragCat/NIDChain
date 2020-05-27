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

const Request = (props) => {
    const classes = useStyles();

    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;

    const [ type, setType ] = useState("");
    const [ name, setName ] = useState("");
    const [ admin, setAdmin ] = useState("");
    const [ phone, setPhone ] = useState("");
    const [ mail, setMail ] = useState("");
    const [ nidAddr, setNidAddr ] = useState("");
    const [ nidPort, setNidPort ] = useState("");
    const [ pool, setPool ] = useState("");

    useEffect(() => {
        document.title = "NIDChain组织变更";
    }, []);

    const handleSubmit = async (event) => {
        try{
            const typeValue = parseInt(type);       
            const nidPortValue = parseInt(nidPort);
            console.log(typeValue)
            console.log(name);
            console.log(admin);
            console.log(phone);
            console.log(mail);
            console.log(nidAddr);
            console.log(nidPortValue);
            console.log(pool);
            const tx = await contract.methods.createOrgRequest(
                typeValue, 
                name, 
                admin,
                phone,
                mail,
                nidAddr,
                nidPortValue,
                pool
            ).send({ 
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
            <h2>组织变更请求</h2>
            <div>
            <FormControl required className={classes.FormControl}>
            <InputLabel>变更类型</InputLabel>
            <Select 
                required 
                value={type} 
                onChange={(e) => {setType(e.target.value)}}
            >
                <MenuItem value="0">注册</MenuItem>
                <MenuItem value="1">修改</MenuItem>
                <MenuItem value="2">删除</MenuItem>
            </Select>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="组织名称"
                value={name} 
                onChange={(e) => {setName(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="管理员姓名"
                value={admin} 
                onChange={(e) => {setAdmin(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="管理员电话"
                value={phone} 
                onChange={(e) => {setPhone(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="管理员邮箱"
                value={mail} 
                onChange={(e) => {setMail(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="NID管理服务器IPv6地址"
                value={nidAddr} 
                onChange={(e) => {setNidAddr(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="NID管理服务器端口"
                value={nidPort} 
                onChange={(e) => {setNidPort(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
            <div>
            <FormControl className={classes.FormControl}>
            <TextField 
                required
                label="组织IPv6地址池"
                value={pool} 
                onChange={(e) => {setPool(e.target.value)}}
            >
            </TextField>
            </FormControl>
            </div>
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

export default Request;
