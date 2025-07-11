const express = require('express');
const Banner = require('../models/banner');
const bannerRouter = express.Router();

bannerRouter.post('/api/banner', async (req, res)=>{
    try {
        const {image} = req.body;
        const banner = new Banner({image});
        await banner.save();
        res.status(201).send(banner);
    } catch (e) {
        res.status(400).json({
            error: e.message,});
    }
});

module.exports = bannerRouter;