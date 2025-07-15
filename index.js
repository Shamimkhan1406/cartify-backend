//console.log("Hello World");

// import the express module
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const bannerRouter = require("./routes/banner");
const categoryRouter = require("./routes/category");
const subCategoryRouter = require("./routes/sub_category");
const productReviewRouter = require("./routes/product_review");
const productRouter = require("./routes/product");
// import the dotenv module to load environment variables
require ("dotenv").config();

// define the port number the server will listen on
const PORT = 3000;

// create an instance of express application
// because it give us a starting point
const app = express();
// mongodb string

const DB = process.env.DB_key;
// middleware to register the route or two mount routes
app.use(express.json());
app.use(cors());  // enable CORS for all routes and origins
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productReviewRouter);
app.use(productRouter);

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