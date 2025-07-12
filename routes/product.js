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

productRouter.get('/api/populer-products', async (req, res)=> {
    try {
        const product = await Product.find({populer: true});
        if(!product || product.length === 0){
            return res.status(404).json({
                error: "No popular products found",
            });
        }else {
            return res.status(200).send(product);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

productRouter.get('/api/recommended-products', async (req, res)=> {
    try {
        const product = await Product.find({recommended: true});
        if(!product || product.length === 0){
            return res.status(404).json({
                error: "No recommended products found",
            });
        }else {
            return res.status(200).send(product);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

module.exports = productRouter;