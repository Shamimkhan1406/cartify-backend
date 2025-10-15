const express = require("express");
const User = require("../models/users");
const Vendor = require("../models/vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../helper/send_email");
const crypto = require("crypto");
const { auth } = require("../middleware/auth");

const authRouter = express.Router();

const optStore = new Map();

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
            // generate otp
            const otp = crypto.randomInt(100000, 999999).toString();
            // store otp with email in map
            optStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // otp valid for 10 minutes
            // create a new user
            let user = new User({
                email,
                fullName,
                password: hashPassword,
                isVerified: false,
            });
            user = await user.save();
            // send otp email
            emailResponse = await sendOtpEmail(email, otp);

            res.status(201).json({
                msg: "User created successfully, otp sent to email",
                emailResponse,
            });
            //res.json({ user });

        }
    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});
// verify otp api point
authRouter.post("/api/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = optStore.get(email);
        if (!storedOtp) {
            return res.status(400).json({
                msg: "No OTP found or OTP has expired",
            });
        }
        if (storedOtp.otp !== otp) {
            return res.status(400).json({
                msg: "Invalid OTP",
            });
        }
        if (storedOtp.expiresAt < Date.now()) {
            optStore.delete(email);
            return res.status(400).json({
                msg: "OTP has expired",
            });
        }
        // mark user as verified
        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({
                msg: "User not found",
            });
        };
        optStore.delete(email);
        // send welcome email
        return res.status(200).json({
            msg: "Email verified successfully",
            user,
        });
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
        if (!findUser.isVerified) {
            return res.status(403).json({
                msg: "User is not verified. Please verify your email first."
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
});

// delete user or vendor api
authRouter.delete("/api/delete-users/:id", auth, async (req, res) => {
    try {
        // extract the id parameter from the request url
        const {id} = req.params;
        // check if a reguler user or a vendor exists with the given id in database
        const user = await User.findById(id); /// mongodb matches 'id' with '_id'
        const vendor = await Vendor.findById(id);
        // we can check either (user || vendor) or (user && vendor)
        if (!user && !vendor) {
            return res.status(404).json({
                msg: "User not found"
            });

        }
        // delete the user or vendor
        if (user) {
            await User.findByIdAndDelete(id);
        }
        else if (vendor) {
            await Vendor.findByIdAndDelete(id);
        }
        return res.status(200).json({
            msg: "User deleted successfully"
        });

    } catch (e) {
        res.status(500).json({
            error: e.message,
        });
    }
});

module.exports = authRouter;