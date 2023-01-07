const express = require("express");
const { CreatePost } = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, CreatePost);

module.exports = router;