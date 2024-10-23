const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Ensure you have a User model defined
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        required: true
    },
    likes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    ]
});

// Register the schema with Mongoose
const Post = mongoose.model("post", postSchema);

module.exports = Post;
