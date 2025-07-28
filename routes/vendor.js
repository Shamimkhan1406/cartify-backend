const express = require('express');
const Vendor = require('../models/vendor');
const vendorRouter = express.Router();

vendorRouter.post("/api/vendor/signup", async (req,res)=>{
    try {
        const {email,fullName,password} = req.body;
        const existingEmail = await Vendor.findOne({email});
        if(existingEmail){
            return res.status(400).json({
                msg:"Vendor Email already exists"
            });
        }
        else{
            // generate a salt with a cost factor of 10
            const salt = await bcrypt.genSalt(10);
            // hash the password using the salt
            const hashPassword = await bcrypt.hash(password,salt);
            // create a new user
            let vendor = new Vendor({
                email,
                fullName,
                password:hashPassword
            });
            vendor = await vendor.save();
            res.json({vendor});
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});