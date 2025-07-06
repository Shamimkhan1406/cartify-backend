//console.log("Hello World");

// import the express module
const express = require("express");
const helloRoute = require("./routes/hello");
const mongoose = require("mongoose");
require ("dotenv").config();

// define the port number the server will listen on
const PORT = 3000;

// create an instance of express application
// because it give us a starting point
const app = express();
// mongodb string

const DB = process.env.DB_key;
// middleware to register the route or two mount routes
app.use(helloRoute);

mongoose.connect(DB).then(()=>{
    console.log("connected to database");
}).catch((error)=>{
    console.error("Error connecting to database:", error);
});

// app.get("/hello", function (req, res) {
//     res.send("Hello World");
// })

// start the server and listne to the specified port
app.listen(PORT, "0.0.0.0", function () {
    console.log(`Server started at http://localhost:${PORT}`);
}
);