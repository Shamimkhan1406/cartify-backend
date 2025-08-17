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

module.exports = orderRouter;