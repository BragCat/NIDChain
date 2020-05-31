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
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';

import NIDOrgContract from "./contracts/NIDOrg.json";
import Web3 from 'web3';

import { Link } from 'react-router-dom';

const getModalStyle = () => {
    const top = 50;
    const left = 50;
  
    return {
        top,
        left,
    };
};

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
        height: 300
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

const RequestCard = (props) => {
    const web3 = props.eth.web3;
    const accounts = props.eth.accounts;
    const contract = props.eth.contract;
    const id = props.request.id;
    const typeValue = props.request.reqType === 0 ? 
        "注册" : 
        ( props.request.reqType === 1 ? 
            "更新" :
            "删除"
        );
    const name = props.request.name;
    const admin = props.request.admin;
    const phone = props.request.phone;
    const mail = props.request.mail;
    const nidAddr = props.request.nidAddr;
    const nidPort = props.request.nidPort;

    const classes = useStyles();

    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
    });

    const submitApprove = async () => {
        try {
            const tx = await contract.methods.requestApprove(
                id
            ).send({
                from: accounts[0]
            });
            alert("Org request approved!");
            window.location.reload();
        } catch (error) {
            alert("Approve Org request failed!");
            console.error(error);
        }
    };

    const submitReject = async () => {
        try {
            await contract.methods.requestReject(
                id
            ).send({
                from: accounts[0]
            });
            alert("Org request rejected!");
            window.location.reload();
        } catch (error) {
            alert("Reject Org request failed!");
            console.error(error);
        }
    }

    return (
        <div className="request-card-container">
            <Card className={classes.card}>
                <CardActionArea>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            组织名称：{ name }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            申请类型：{ typeValue }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            管理员姓名：{ admin }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            管理员电话：{ phone }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            管理员邮箱：{ mail }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            NID管理服务器IPv6地址：{ nidAddr }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            NID管理服务器端口：{ nidPort }
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            申请账号：{ id }
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button
                        onClick={submitApprove}
                        variant="contained"
                        className={classes.button}
                    >
                        通过
                    </Button>
                    <Button
                        onClick={submitReject}
                        variant="contained"
                        className={classes.button}
                    >
                        拒绝
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default RequestCard;