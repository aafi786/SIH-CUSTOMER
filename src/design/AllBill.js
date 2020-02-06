import React, { Component } from 'react';
import axios from 'axios';
import StripeCheckout from 'react-stripe-checkout';
import { Drawer, message, notification } from 'antd';

export default class AllBill extends Component {
    constructor() {
        super();
        this.state = {
            result: [],
            visible: false,
            singleBill: {}
        }
    }
    componentDidMount() {
        axios.post('http://localhost:5000/bill/getbill-custid', {
            custid: "5e2fd43f4dd7120ef8c125f0"
        })
            .then(res => {
                console.log(res.data.msg)
                this.setState({
                    result: res.data.msg
                })
            })
            .catch(err => console.log(err))
    }
    showDrawer = (id) => {
        axios.post('http://localhost:5000/bill/getbillbyid', {
            id
        })
            .then(res => {
                this.setState({
                    singleBill: res.data.msg
                })
                console.log(res.data)
            })
            .catch(err => console.log(err))
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    handleToken = (token, address) => {
        // console.log({
        //     token,
        //     address
        // })
        notification['info']({
            message: 'Payment Processing !',
            description:
                'Sit Back n Relax We Are Processing Your Payment',
        });
        axios.post('http://localhost:5000/bill/paybill', {
            token,
            billInfo: this.state.singleBill
        })
            .then(res => {
                if (res.data.status === 'success') {
                    notification.destroy();
                    notification['success']({
                        message: 'Txn Succesfull !',
                        description:
                            'Thank You, Your payment Has been processed !',
                    });
                    console.log(res.data.data)

                }
                if (res.data.status === 'failure') {
                    notification.destroy();
                    notification['error']({
                        message: 'Txn Failure !',
                        description:
                            'Please Try Again ',
                    });
                }
            })
    }
    render() {
        return (
            <div>
                <Drawer
                    title="Bill Details"
                    placement="right"
                    closable={false}
                    onClose={this.onClose}
                    visible={this.state.visible}
                    width={350}
                >
                    <p>UID : {this.state.singleBill._id}</p>
                    <p>Invoice No. : {this.state.singleBill.invoiceNo}</p>
                    <p>Title : {this.state.singleBill.title}</p>
                    <p>Date : {this.state.singleBill.date}</p>
                    <p>Amount : {this.state.singleBill.due}</p>
                    <StripeCheckout
                        className="cover-btn"
                        style={{ background: '#EF5969' }}
                        stripeKey="pk_test_ktr9VmOu97m8KPWX1cXxtHGy"
                        token={this.handleToken}
                        currency="INR"
                        amount={this.state.singleBill.due * 100}
                    />


                </Drawer>
                <h1>All Bills</h1>
                <div class="uk-child-width-1-2@s uk-child-width-1-3@m mt-4" uk-grid="true">

                    {
                        this.state.result.map((data, index) => (
                            <div key={index}>
                                <div className="uk-card uk-card-default uk-card-body uk-width-1-1@m">
                                    <h3 className="uk-card-title" onClick={() => { this.showDrawer(data._id) }}><a href="#">#{data.invoiceNo}</a></h3>
                                    <div className="mt-4 leading-none">
                                        <p className="text-sm">Title :{data.title}</p>
                                        <p>Date : {data.date} </p>
                                        <p>Due : {data.due} </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    }

                    {/* Looping ENDS HERE */}

                </div>
            </div>
        )
    }
}
