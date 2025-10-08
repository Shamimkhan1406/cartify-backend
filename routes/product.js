const express = require('express');
const Product = require('../models/product');
const productRouter = express.Router();
const {auth,vendorAuth} = require("../middleware/auth");

// Create a new product
productRouter.post('/api/add-product',auth,vendorAuth, async (req, res)=> {
    try {
        const {productName, productPrice, quantity, description, images, category, vendorId, fullName, subCategory} = req.body;
        const product = new Product({productName, productPrice, quantity, description, images, category, vendorId, fullName, subCategory});
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
                msg: "No popular products found",
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
                msg: "No recommended products found",
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
// retrieve populer product by category
productRouter.get('/api/products-by-category/:category', async (req, res)=>{
    try {
        const {category} = req.params;
        const products = await Product.find({category, populer: true});
        if (!products || products.length === 0){
            return res.status(404).json({
                msg: "No products found for this category",
            
            });
        }
        else{
            return res.status(200).json(products);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

module.exports = productRouter;