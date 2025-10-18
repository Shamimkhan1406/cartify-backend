const express = require('express');
const Vendor = require('../models/vendor');
const User = require('../models/users');
const vendorRouter = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");

// signup api point


vendorRouter.post("/api/v2/vendor/signup", async (req,res)=>{
    try {
        const {email,fullName,storeName,storeImage,storeDescription,password} = req.body;
        // check if the email already in user collection
        const existingUserEmail = await User.findOne({email});
        if(existingUserEmail){
            return res.status(400).json({
                msg:"A user with this email already exists"
            });
        }
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
                storeName,
                storeImage,
                storeDescription,
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
// check token validity api
vendorRouter.post("/api/vendor/tokenIsValid", async (req, res) =>{
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.json(false);
        const verified = jwt.verify(token, 'passwordKey');
        if (!verified) return res.json(false);
        const vendor = await Vendor.findById(verified.id); //|| await Vendor.findById(verified.id);
        if (!vendor) return res.json(false);
        return res.json(true);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// define a get route for fetching the logged in user's data
vendorRouter.get("/get-vendor", auth, async (req, res) => {
    try {
        // retrieve the vendor from the id from authenticated vendor
        const vendor = await Vendor.findById(req.user);
    // send the vendor data as json response including the vendor document field and token
        return res.json({ ...vendor._doc, token: req.token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// signin api point
vendorRouter.post("/api/v2/vendor/signin", async (req,res)=>{
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
                const token = jwt.sign({id:findUser._id},"passwordKey",{expiresIn:"30d"});
                // remove the password from the response
                const {password, ...vendorWithoutPassword} = findUser._doc;
                // sent the response
                res.json({
                    token,
                    vendorWithoutPassword
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

// fetch all the vendons excluding the password
vendorRouter.get('/api/vendors', async (req, res) => {
    try {
        const vendors = await Vendor.find().select('-password');
        return res.status(200).json(vendors);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        })
    }
})

module.exports = vendorRouter;