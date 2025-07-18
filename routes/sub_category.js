const express = require('express');
const SubCategory = require('../models/sub_category');
const subCategory = require('../models/sub_category');
const subCategoryRouter = express.Router();

subCategoryRouter.post('/api/subcategories',async (req, res)=> {
    try {
        const {categoryId, categoryName, image, subCategoryName} = req.body;
        const subCategory = new SubCategory({categoryId, categoryName, image, subCategoryName});
        await subCategory.save();
        res.status(201).send(subCategory);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

// get all subcategories
subCategoryRouter.get('/api/subcategories', async (req, res) =>{
    try {
        const subcategories = await SubCategory.find();
        return res.status(200).json(subcategories);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

subCategoryRouter.get('/api/categories/:categoryName/subcategories', async (req, res)=> {
    try {
        const {categoryName} = req.params;
        const subcategories = await subCategory.find({categoryName: categoryName});
        if (!subcategories || subcategories.length === 0){
            return res.status(404).json({
                msg: "subcategory not found",
            });
        }
        else {
            return res.status(202).json({subcategories});
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        })
    }
})

module.exports = subCategoryRouter;