const express = require("express");
const { register ,login ,followUser , logout, updatePassword, updateProfile, deleteMyAccount, myProfile, getUserProfile, getAllUsers, forgotPassword, resetPassword} = require("../controllers/user");
const {isAuthenticated} = require("../middlewares/auth")
const router = express.Router();

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/follow/:id").get(isAuthenticated,followUser);
router.route("/logout").get(isAuthenticated,logout);
router.route("/update/password").put(isAuthenticated, updatePassword);
router.route("/update/profile").put(isAuthenticated, updateProfile);
router.route("/delete/me").delete(isAuthenticated, deleteMyAccount);
router.route("/me").get(isAuthenticated, myProfile);
router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers);
router.route("/forgot/password").get(isAuthenticated, forgotPassword);
router.route("/reset/password/:token").put(resetPassword);

module.exports = router;