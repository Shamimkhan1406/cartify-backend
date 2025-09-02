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
// delete route for deleting a specific order by id
orderRouter.delete('/api/orders/:id', async (req, res)=> {
    try {
        // extract the id from req parameter
        const {id} = req.params;
        // find the order by _id and delete it
        const deletedOrder = await Order.findByIdAndDelete(id);
        // check if the order was found and deleted
        if (!deletedOrder){
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
orderRouter.get('/api/orders/:vendorId', async (req, res) => {
    try {
        // extract vendorId from the request parameters
        const { vendorId } = req.params;
        // find all orders associated with the given vendorId
        const orders = await Order.find({ vendorId });
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