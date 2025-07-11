const express = require('express');
const Banner = require('../models/banner');
const bannerRouter = express.Router();

bannerRouter.post('/api/banner', async (req, res)=>{
    try {
        const {Image} = req.body;
        const banner = new Banner({Image});
        await banner.save();
        res.status(201).send(banner);
    } catch (e) {
        res.status(400).json({
            error: e.message,});
    }
});

module.exports = bannerRouter;