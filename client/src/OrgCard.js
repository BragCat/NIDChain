import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';
import EthCrypto from 'eth-crypto';

import NIDOrgContract from "./contracts/NIDOrg.json";
import Web3 from 'web3';

import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(1),
        display: 'table-cell'
    },
    
    card: {
        width: 400,
        height: 170,
    },
    media: {
        height: 140,
    },
    paper: {
        position: 'absolute',
        width: 500,
        backgroundColor: theme.palette.background.paper,
        border: 'none',
        boxShadow: 'none',
        padding: 4,
    },
}));

const OrgCard = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const adminContract = props.eth.contract;

    const [ contract, setContract ] = useState(null);
    const [ org, setOrg ] = useState(props.org);
    const [ open, setOpen ] = useState(false);
    const [ isOwner, setIsOwner ] = useState(false);

    const [ name, setName ] = useState(null);
    const [ admin, setAdmin ] = useState(null);
    const [ phone, setPhone ] = useState(null);
    const [ mail, setMail ] = useState(null);
    const [ nidAddr, setNidAddr ] = useState(null);
    const [ nidPort, setNidPort ] = useState(null);
    const [ pool, setPool ] = useState(null);
    const [ key, setKey ] = useState("");

    const classes = useStyles();

    useEffect(() => {
        if (org) {
            init(org);
        }
    }, [org]);

    const init = async (org) => {
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = NIDOrgContract.networks[networkId];
            const contract = new web3.eth.Contract(
                NIDOrgContract.abi,
                org
            );
            setContract(contract);

            const name = await contract.methods.name().call();
            const admin = await contract.methods.admin().call();
            const phone = await contract.methods.phone().call();
            const mail = await contract.methods.mail().call();
            const nidAddr = await contract.methods.nidAddr().call();
            const nidPort = await contract.methods.nidPort().call();
            const pool = await contract.methods.pool().call();
            setName(name);
            setAdmin(admin);
            setPhone(phone);
            setMail(mail);
            setNidAddr(nidAddr);
            setNidPort(nidPort);
            setPool(pool);

            const user = accounts[0].toLowerCase();
            const owner = await contract.methods.id().call(); 
            if (user == owner) {
                setIsOwner(true);
            }
        } catch (error) {
            alert("Call NIDOrg methods failed!");
            console.error(error);
        }
    };

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const submitUpdate = async () => {
        try {
            const publicKey = await adminContract.methods.auditKey().call();
            console.log("Audit public key: " + publicKey);
            const encryptedKey = await EthCrypto.encryptWithPublicKey(
                publicKey, 
                JSON.stringify(key)
            );
            const encryptedString = EthCrypto.cipher.stringify(encryptedKey);
            console.log("Encrypted key: " + encryptedString);

            const t = new Date();
            const effectTime = Math.round(t.getTime() / 1000);
            console.log("Key effect time: " + effectTime);
            await contract.methods.updateKey(
                encryptedString,
                effectTime
            ).send({
                from: accounts[0]
            });
            alert("Update key succeeded!");
            setOpen(false);
            window.location.reload();
        } catch (error) {
            alert("Update key failed!");
            console.error(error);
        }
    };

    return (
        <div className="org-card-container">
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    更新密钥信息
                </DialogTitle>
                <DialogContent>
                    <p>组织名称：{name}</p>
                    <p>组织管理员姓名：{admin}</p>
                    <p>组织管理员电话：{phone}</p>
                    <p>组织管理员邮箱：{mail}</p>
                    <p>NID管理服务器地址：{nidAddr}</p>
                    <p>NID管理服务器端口：{nidPort}</p>
                    <p>组织IPv6地址池：{pool}</p>
                    {isOwner && 
                    <div>
                        <FormControl className={classes.formControl}>
                        <TextField 
                            required
                            label="IDEA密钥"
                            value={key} 
                            onChange={(e) => {setKey(e.target.value)}}
                        />
                        </FormControl>
                    </div>
                    }
                </DialogContent>
                <DialogActions>
                    {isOwner &&
                    <Button onClick={submitUpdate} color="primary">
                        提交
                    </Button>
                    }
                    <Button onClick={handleClose} color="primary">
                        取消
                    </Button>
                </DialogActions>
            </Dialog>

            <Card className={classes.card} onClick={handleOpen}>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            组织名称：{name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="div">
                            组织IPv6地址池：{pool}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button
                        onClick={handleOpen}
                        variant="contained"
                        className={classes.button}>
                        View More
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default OrgCard;
