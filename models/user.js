const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/data_association");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    name: String,
    age: Number,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post" // Reference to the post model
    }],
    profilepic: {
        type: String,
        default: "default.jpg"
    }
});

// Register the schema with Mongoose
const User = mongoose.model("user", userSchema);

module.exports = User;
