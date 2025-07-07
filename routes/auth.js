const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcryptjs");

const authRouter = express.Router();

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

module.exports = authRouter;