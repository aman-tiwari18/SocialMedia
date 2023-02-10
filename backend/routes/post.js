const express = require("express");
const { CreatePost , likeAndUnlikePost,DeletePost ,getPostOfFollowing , updateCaption ,commentOnPost, deleteComment} = require("../controllers/post");
const { isAuthenticated } = require("../middlewares/auth");
const { route } = require("./user");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, CreatePost);
router.route("/post/:id").get(isAuthenticated, likeAndUnlikePost);
router.route("/post/:id").delete(isAuthenticated, DeletePost);
router.route("/posts").get(isAuthenticated, getPostOfFollowing);
router.route("/post/:id").put(isAuthenticated, updateCaption);
router.route("/post/comment/:id").put(isAuthenticated, commentOnPost);
router.route("/post/comment/:id").delete(isAuthenticated, deleteComment);


module.exports = router;