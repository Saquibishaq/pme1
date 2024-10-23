const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/posts");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multerconfig = require('./config/multerconfig');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
const path = require('path');
const upload = require('./config/multerconfig');
app.use(express.static(path.join(__dirname,"public")))
app.listen(9000, () => {
    console.log("Server is running on port 9000");
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", async (req, res) => {
    let { email, password, username, name, age } = req.body;
    let user = await userModel.findOne({ email });
    if (user) res.redirect("/login");
    bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                email,
                password: hash,
                username,
                name,
                age,
            });
            let token = jwt.sign({ email: email, userid: user._id }, "SECRET");
            res.cookie("token", token);
            res.send("Hurray! You Registered!!!");

        });
    });
});

app.post("/login", async function (req, res) {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email });
        
        if (!user) {
            return res.send("OOPS!!....User Not Registered ");
        }

        const result = await bcrypt.compare(password, user.password);
        
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "SECRET");
            res.cookie("token", token);
            res.redirect("/profile");
        } else {
            res.send("Invalid Password or username ");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Server error");
    }
});

app.get("/edit", isloggedin, async (req, res) => {
    res.render("edit");
});
app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/login");
});

app.get("/profile", isloggedin, async (req, res) => {
    let user = await userModel.findById(req.user.userid).populate("posts");
    res.render("profile", { user });
});
app.get("/like/:id", isloggedin, async (req, res) => {
    try {
        let post = await postModel.findById(req.params.id); 
        if (post.likes.indexOf(req.user.userid) === -1) {
            post.likes.push(req.user.userid);
        } else {
            post.likes.splice(post.likes.indexOf(req.user.userid), 1);
        }
        await post.save();
        res.redirect("/profile");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


function isloggedin(req, res, next) {
    if (!req.cookies.token) {
        return res.redirect("/login");
    }
    try {
        let data = jwt.verify(req.cookies.token, "SECRET");
        req.user = data;
        next();
    } catch (error) {
        res.redirect("/login");
    }
}

app.post("/posts", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findById(req.user.userid); 
        let { content } = req.body;
        
        let post = await postModel.create({
            user: user._id,
            content,
        });
        
        user.posts.push(post._id);
        await user.save(); 
        res.redirect("/profile"); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/posts", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findById(req.user.userid); 
        let { content } = req.body;
        
        let post = await postModel.create({
            user: user._id,
            content,
        });
        
        user.posts.push(post._id);
        await user.save(); 
        res.redirect("/profile"); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/profile/upload", function (req, res) {
    res.render("profile_upload");
}) 
app.post("/upload",isloggedin, upload.single("image"), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
});
