const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Vendor= require('../models/vendor');

// authentication middleware
// this middleware will verify the token sent in the request headers and check if the user exists in the database

const auth = async (req, res, next) => {
    try {
        // extract the token from the request headers
        const token = req.header('x-auth-token');
        // if no token is found, return a 401 status with a message
        if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
        // verify the token using the secret key
        const verifyed = jwt.verifyed(token, 'passwordKey');
        // if the token is invalid, return a 401 status with a message
        if (!verifyed) return res.status(401).json({ msg: 'Token verification failed, authorization denied' });
        // find the user or vendor by id from the token
        const user = await User.findById(verifyed.id) || await Vendor.findById(verifyed.id);
        // if no user or vendor is found, return a 401 status with a message
        if (!user) return res.status(401).json({ msg: 'User not found, authorization denied' });
        // attach the user or vendor to the request object
        // this makes the user or vendor available in the next middleware or route handler
        req.user = user;
        // attach the token to the request object
        req.token = token;
        // call the next middleware or route handler
        next();
        
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}