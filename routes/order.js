const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');
// import the dotenv module to load environment variables
require ("dotenv").config();
const stripe = require('stripe')(process.env.stripe_key);
const { auth, vendorAuth } = require("../middleware/auth");
const { status } = require('express/lib/response');

// create a payment intent
orderRouter.post('/api/payment', async (req, res)=>{
    try {
        const { orderId,paymentMethodId, currency='inr'} = req.body;
        // validate the pressence of the required fields
        if (!orderId || !paymentMethodId || !currency){
            return res.status(400).json({
                msg:"All fields are required"
            });
        }
        // query for the order by orderId
        const order = await Order.findById(orderId);
        if (!order){
            console.log("Order not found");
            return res.status(404).json({
                msg:"Order not found"
            });
        }
        // calculate the total amount (price * quantity)
        const amount = order.productPrice * order.quantity * 100; // convert to the smallest currency unit
        // create a payment intent with the specified amount, currency, and payment method
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method: paymentMethodId,
            automatic_payment_methods: {
                enabled: true,
            },
            //confirm: true, // confirm the payment immediately
        });
        console.log("payment status: ",paymentIntent.status);
        return res.json({
            status: 'success',
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // convert back to the main currency unit
            currency: paymentIntent.currency,
            
        })
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

// post route for creating a new order
orderRouter.post('/api/orders', auth, async (req, res) => {
    try {
        const { productId, fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId, } = req.body;
        const createdAt = Date.now(); // get the current timestamp
        // create a new order instance with the extracted data
        const order = new Order(
            { productId, fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId, createdAt }
        );
        // save the order to the database
        await order.save();
        // send a success response
        return res.status(201).json({
            msg: "Order placed successfully",
            order: order,
        });
    } catch (e) {
        // handle any errors that occur during the process
        res.status(500).json({
            error: e.message,
        });
    }
});

// get route for retrieving all orders by buyerId
orderRouter.get('/api/orders/:buyerId', auth, async (req, res) => {
    try {
        // extract buyerId from the request parameters
        const { buyerId } = req.params;
        // find all orders associated with the given buyerId
        const orders = await Order.find({ buyerId });
        // if no orders are found, return a 404 status with a message
        if (!orders || orders.length === 0) {
            return res.status(404).json({
                msg: "No orders found for this buyer",
            });
        }
        // if orders are found, return the found orders with a 200 status
        return res.status(200).json(orders);
    } catch (error) {
        // handle any errors that occur during the process
        res.status(500).json({
            error: error.message,
        });
    }
});
// delete route for deleting a specific order by id
orderRouter.delete('/api/orders/:id', auth, async (req, res) => {
    try {
        // extract the id from req parameter
        const { id } = req.params;
        // find the order by _id and delete it
        const deletedOrder = await Order.findByIdAndDelete(id);
        // check if the order was found and deleted
        if (!deletedOrder) {
            return res.status(404).json({
                msg: "Order not found",
            });
        }
        // return the deleted order
        return res.status(200).json({
            msg: "Order deleted successfully",
            //order: deletedOrder,
        });

    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})
// get route for retrieving all orders by VendorId
orderRouter.get('/api/orders/vendors/:vendorId', auth, vendorAuth, async (req, res) => {
    try {
        // extract vendorId from the request parameters
        const { vendorId } = req.params;
        // find all orders associated with the given vendorId
        const orders = await Order.find({ vendorId });
        // if no orders are found, return a 404 status with a message
        if (!orders || orders.length === 0) {
            return res.status(404).json({
                msg: "No orders found for this vendor",
            });
        }
        // if orders are found, return the found orders with a 200 status
        return res.status(200).json(orders);
    } catch (error) {
        // handle any errors that occur during the process
        res.status(500).json({
            error: error.message,
        });
    }
});
// patch method for updating the delivery status
orderRouter.patch('/api/orders/:id/delivered', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { delivered: true, processing: false },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({
                msg: "Order not found",
            });

        }
        else {
            return res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});
// patch method for updating the processing status
orderRouter.patch('/api/orders/:id/processing', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { processing: false, delivered: false },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({
                msg: "Order not found",
            });

        }
        else {
            return res.status(200).json(updatedOrder);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

orderRouter.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        return res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

module.exports = orderRouter;