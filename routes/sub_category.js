const express = require('express');
const SubCategory = require('../models/sub_category');
const subCategoryRouter = express.Router();

subCategoryRoutrs.post('/api/subcategories',async (req, res)=> {
    try {
        const {categoryId, categoryName, image, subCategoryName} = req.body;
        const subCategory = new SubCategory({categoryId, categoryName, image, subCategoryName});
        await subCategory.save();
        res.status(2001).send(subCategory);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

module.exports = subCategoryRouter;