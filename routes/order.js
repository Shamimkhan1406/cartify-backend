const express = require('express');
const orderRouter = express.Router();
const Order = require('../models/order');

// post route for creating a new order
orderRouter.post('/api/orders', async (req, res) => {
    try {
        const { fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId, } = req.body;
        const createdAt = Date.now(); // get the current timestamp
        // create a new order instance with the extracted data
        const order = new Order(
            { fullName, email, state, city, locality, productName, productPrice, quantity, category, image, buyerId, vendorId, createdAt }
        );
        // save the order to the database
        await order.save();
        // send a success response
        return res.status(201).json(order);
    } catch (e) {
        // handle any errors that occur during the process
        res.status(500).json({
            error: e.message,
        });
    }
});

// get route for retrieving all orders by buyerId
orderRouter.get('/api/orders/:buyerId', async (req, res) => {
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


module.exports = orderRouter;