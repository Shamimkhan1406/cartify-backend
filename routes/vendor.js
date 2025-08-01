const express = require('express');
const Vendor = require('../models/vendor');
const vendorRouter = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// signup api point


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
// signin api point
vendorRouter.post("/api/vendor/signin", async (req,res)=>{
    try {
        const {email,password} = req.body;
        const findUser = await Vendor.findOne({email});
        if (!findUser){
            return res.status(400).json({
                msg:"Vendor does not exist"
            });
        }
        else{
            const isMatch = await bcrypt.compare(password,findUser.password);
            if (!isMatch){
                return res.status(400).json({
                    msg:"password does not match"
                });
            }
            else{
                const token = jwt.sign({id:findUser._id},"passwordKey");
                // remove the password from the response
                const {password, ...vendorWithoutPassword} = findUser._doc;
                // sent the response
                res.json({
                    token,
                    vendor: vendorWithoutPassword
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

module.exports = vendorRouter;