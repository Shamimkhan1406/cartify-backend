const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
    Image: {
        type: String,
        required: true,

    }
});

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;