const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    vendorId: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    subCategory: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        }
    ],
    populer: {
        type: Boolean,
        default: false,
    },
    recommend: {
        type: Boolean,
        default: false,
    },
    // fields for rating
    avgRating: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;