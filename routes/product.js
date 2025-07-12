const express = require('express');
const Product = require('../models/product');
const productRouter = express.Router();

// Create a new product
productRouter.post('/api/add-product', async (req, res)=> {
    try {
        const {productName, productPrice, quantity, description, images, category, subCategory} = req.body;
        const product = new Product({productName, productPrice, quantity, description, images, category, subCategory});
        await product.save();
        return res.status(201).send(product);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

module.exports = productRouter;