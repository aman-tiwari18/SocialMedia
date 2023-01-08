const express = require("express");
const { CreatePost , likeAndUnlikePost,DeletePost ,getPostOfFollowing , updateCaption} = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, CreatePost);
router.route("/post/:id").get(isAuthenticated, likeAndUnlikePost);
router.route("/post/:id").delete(isAuthenticated, DeletePost);
router.route("/posts").get(isAuthenticated, getPostOfFollowing);
router.route("/post/:id").put(isAuthenticated, updateCaption);


module.exports = router;