const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

// signup api point
authRouter.post("/api/signup", async (req,res)=>{
    try {
        const {fullName,email,password} = req.body;
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({
                message:"Email already exists"
            });
        }
        else{
            // generate a salt with a cost factor of 10
            const salt = await bcrypt.genSalt(10);
            // hash the password using the salt
            const hashPassword = await bcrypt.hash(password,salt);
            // create a new user
            let user = new User({
                fullName,
                email,
                password:hashPassword
            });
            user = await user.save();
            res.json({user});
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});
// signin api point
authRouter.post("/api/signin", async (req,res)=>{
    try {
        const {email,password} = req.body;
        const findUser = await User.findOne({email});
        if (!findUser){
            return res.status(400).json({
                message:"User does not exist"
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
                const {password, ...userWithoutPassword} = findUser._doc;
                // sent the response
                res.json({
                    token,
                    ...userWithoutPassword
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

module.exports = authRouter;