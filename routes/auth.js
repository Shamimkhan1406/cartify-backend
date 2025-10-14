const express = require("express");
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendWelcomeEmail = require("../helper/send_email");

const authRouter = express.Router();

// signup api point
authRouter.post("/api/signup", async (req, res) => {
    try {
        const { email, fullName, password } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                msg: "Email already exists"
            });
        }
        else {
            // generate a salt with a cost factor of 10
            const salt = await bcrypt.genSalt(10);
            // hash the password using the salt
            const hashPassword = await bcrypt.hash(password, salt);
            // create a new user
            let user = new User({
                email,
                fullName,
                password: hashPassword
            });
            user = await user.save();
            res.json({ user });
            // send welcome email
            sendWelcomeEmail(email).catch(emailError => {
                // This will now log the rejection to your backend console, 
                // which might contain the specific AWS error code.
                console.error("Failed to send welcome email (check IAM/Sandbox!):", emailError.message);
            });
        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});
// signin api point
authRouter.post("/api/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });
        if (!findUser) {
            return res.status(400).json({
                msg: "User does not exist"
            });
        }
        else {
            const isMatch = await bcrypt.compare(password, findUser.password);
            if (!isMatch) {
                return res.status(400).json({
                    msg: "password does not match"
                });
            }
            else {
                const token = jwt.sign({ id: findUser._id }, "passwordKey");
                // remove the password from the response
                const { password, ...userWithoutPassword } = findUser._doc;
                // sent the response
                res.json({
                    token,
                    user: userWithoutPassword
                });
            }
        }
    } catch (e) {
        res.status(500).json({
            error: e.message
        });
    }
});

// put route for updating user's state, city and locality
authRouter.put("/api/users/:id", async (req, res) => {
    try {
        // extract the id parameter from the request url
        const { id } = req.params;
        // extract the state, city, and locality from the request body
        const { state, city, locality } = req.body;
        // find the user by id and update their state, city, and locality
        // setting new option to true returns the updated document
        // if the user is not found, it will return null
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { state, city, locality },
            { new: true }
        );
        // if the user is not found, return a 404 status code
        if (!updatedUser) {
            return res.status(404).json({
                msg: "User not found"
            });
        }
        // return the updated user
        return res.status(200).json(updatedUser);
    } catch (e) {
        // handle any errors that occur during the process
        res.status(500).json({
            error: e.message,
        });
    }
},);

// fetch all users explude password
authRouter.get("/api/users", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json(users);
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
})

module.exports = authRouter;