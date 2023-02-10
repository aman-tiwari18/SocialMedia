const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const crypto = require("crypto")


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    avatar:{
        public_id: String,
        url: String,

    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: [true, "Email already exsits"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be at least 6 characters"],
        select : false,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

})

// Encrypting password before saving user
UserSchema.pre("save", async function(next){
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10)
}

next()

});

// Compare user password
UserSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password);

}

// Return JWT token
UserSchema.methods.generateToken = async function(){
    return jwt.sign({_id: this._id},process.env.JWT_SECRET);
}

UserSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;

}

module.exports = mongoose.model("User", UserSchema);