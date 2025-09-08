const express = require('express');
const ProductReview = require('../models/product_review');
const productReviewRouter = express.Router();
const Product = require('../models/product');

// Create a new product review
productReviewRouter.post('/api/product-review', async (req, res) => {
    try {
        {
            const { buyerId, email, fullName, productId, rating, review } = req.body;
            const existingReview = await ProductReview.findOne({ buyerId, productId });
            if (existingReview) {
                return res.status(400).json({
                    error: "You have already reviewed this product",

                })
            }
            const reviews = new ProductReview({ buyerId, email, fullName, productId, rating, review });
            await reviews.save();
            // find the product associeated with the review by product id
            const product = await Product.findById(productId);
            // if product is not found return a 404 status
            if (!product) {
                return res.status(404).json({
                    error: "Product not found",
                });
            }
            // if product is found, update the reviews array with the new review and increment the review count by 1
            product.totalRating += 1;
            product.avgRating = (product.avgRating * (product.totalRating - 1) + rating) / product.totalRating;
            await product.save();

            return res.status(201).send(reviews);
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

productReviewRouter.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await ProductReview.find();
        res.status(200).json({ reviews });
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

module.exports = productReviewRouter;