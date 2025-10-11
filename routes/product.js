const express = require('express');
const Product = require('../models/product');
const productRouter = express.Router();
const { auth, vendorAuth } = require("../middleware/auth");
const subCategory = require('../models/sub_category');

// Create a new product
productRouter.post('/api/add-product', auth, vendorAuth, async (req, res) => {
    try {
        const { productName, productPrice, quantity, description, images, category, vendorId, fullName, subCategory } = req.body;
        const product = new Product({ productName, productPrice, quantity, description, images, category, vendorId, fullName, subCategory });
        await product.save();
        return res.status(201).send(product);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

productRouter.get('/api/populer-products', async (req, res) => {
    try {
        const product = await Product.find({ populer: true });
        if (!product || product.length === 0) {
            return res.status(404).json({
                msg: "No popular products found",
            });
        } else {
            return res.status(200).send(product);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

productRouter.get('/api/recommended-products', async (req, res) => {
    try {
        const product = await Product.find({ recommended: true });
        if (!product || product.length === 0) {
            return res.status(404).json({
                msg: "No recommended products found",
            });
        } else {
            return res.status(200).send(product);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});
// retrieve populer product by category
productRouter.get('/api/products-by-category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category, populer: true });
        if (!products || products.length === 0) {
            return res.status(404).json({
                msg: "No products found for this category",

            });
        }
        else {
            return res.status(200).json(products);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

// new route for retriving products by subcategory
productRouter.get('/api/products-by-subcategory/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        // first find the product to find its subcategory
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                msg: "Product not found",
            });
        }
        else {
            // find related product based on subcategory of the product\
            const relatedProduct = await Product.find({ 
                subCategory: product.subCategory, 
                _id: { $ne: productId }, // exclude the current product
            },)
            if (!relatedProduct || relatedProduct.length === 0) {
                return res.status(404).json({
                    msg: "No related products found",
                });
            }
            else {
                return res.status(200).json(relatedProduct);
            }
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

// routes for retriving top 10 highest reated products
productRouter.get('/api/top-rated-products', async (req, res)=> {
    try {
        // fetch all products then sort them by avg rating in descending order 
        const topRatedProduct = await Product.find().sort({ avgRating: -1 }).limit(5); //  -1 for descending order
        // check if no products are found
        if (!topRatedProduct || topRatedProduct.length === 0) {
            return res.status(404).json({
                msg: "No products found",
            });
        }
        else {
            return res.status(200).json(topRatedProduct);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

// fetch all product by subcategory

productRouter.get('/api/producs-by-subcategory/:subCategory', async (req, res)=>{
    try {
        const { subCategory } = req.params;
        const products = await Product.find({subCategory: subCategory});
        if (!products || products.length === 0){
            return res.status(404).json({
                msg: "No products found for this subcategory",
            });
        }
        else {
            return res.status(200).json(products);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

// routes for searching product by name or description
productRouter.get('/api/search-products', async (req,res)=>{
    try {
        // extract the query parameter from the request query string
        const {query} = req.query;
        // validate the query parameter
        // if missing return 400 status
        if (!query){
            return res.status(400).json({
                msg: "Missing search query",
            });
        }
        // search for the product collection for documents where product name or description contains the query string
        const products = await Product.find({
            $or: [
                // regex will match any product containing the query string, case insensitive
                // for example if the query is "phone" it will match "Phone", "smartphone", "headphone" etc
                { productName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ]
        })
        if (!products || products.length === 0){
            return res.status(404).json({
                msg: "No products found matching your query",
            });
        }
        else {
            return res.status(200).json(products);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

module.exports = productRouter;