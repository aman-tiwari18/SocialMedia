const Post = require("../models/Post");
const User = require("../models/User")

// User resgister
exports.register = async (req, res)=>{
    try{
        const {name, email, password} = req.body;
        let user = await User.findOne({email})
        if(user){
            return res
            .status(400)
            .json({
                success: false,
                message: "User already",
        })
        
    }
    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "sample_id",
            url: "sample url"
        },
    })
    const token = await user.generateToken();
            const option = {
                expires: new Date(Date.now()+90*24*60*60*1000),
                httpOnly: true,
            }

            res.status(201).cookie("token" ,token, option )
            .json({
                success: true,
                message: "congrats",
                user,
                token,
            })

}
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// user login
exports.login = async (req,res)=>{
        try {
            const {email, password} = req.body;
            const user = await User.findOne({email}).select("+password");
            if(!user){
                return res.status(400).json({
                    success: false,
                    message: "User not found",
                })
            }
            const isMatched = await user.matchPassword(password);
            if(!isMatched){
                return res.status(400).json({
                    success: false,
                    message: "Invalid password",
                })
            }
            const token = await user.generateToken();
            const option = {
                expires: new Date(Date.now()+90*24*60*60*1000),
                httpOnly: true,
            }

            res.status(200).cookie("token" ,token, option )
            .json({
                success: true,
                user,
                token,
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            })
        }
}

//User logout

exports.logout = async (req, res)=>{
    try {
        res
        .status(200).cookie("token", null, {expires: new Date(Date.now()), httpOnly: true})
        .json({
            success: true,
            message: "Logged out",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// User Follow and unfollow

exports.followUser = async (req, res)=>{
    try {
        
        const userToFollow = await User.findById(req.params.id);
        const logedInUser = await User.findById(req.user._id);

        if(!userToFollow){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        if(logedInUser.following.includes(userToFollow._id)){

            const index = logedInUser.following.indexOf(userToFollow._id);
            logedInUser.following.splice(index,1);

            const index2 = userToFollow.followers.indexOf(logedInUser._id);
            userToFollow.followers.splice(index2,1);

            await logedInUser.save();
            await userToFollow.save();

            return res.status(200).json({
                success: true,
                message: "User unfollowed",
                userToFollow,
            })

        }

        logedInUser.following.push(userToFollow._id);
        userToFollow.followers.push(logedInUser._id);
        await logedInUser.save();
        await userToFollow.save();
        res.status(200).json({
            success: true,
            message: "User followed",
            userToFollow,
          });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// update password

exports.updatePassword = async (req, res)=>{
    try {
        const user  = await User.findById(req.user._id).select("+password");
        const {oldPassword, newPassword} = req.body;
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message:  "please provide new and old password"
            })
        }
        const isMatched = await user.matchPassword(oldPassword);
        if(!isMatched){
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            })
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "password updated"

        })

}
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    
}


// update profile

exports.updateProfile = async (req ,res) =>{
    try {
        
        const user = await User.findById(req.user._id);
        const {name, email} = req.body;
        if(name){
            user.name = name
        }
        if(email){
            user.email = email
        }

        await user.save();
        res.status(200).json({
            success: true,
            message : "Profile updated",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Delete my Account

exports.deleteMyAccount = async (req, res) =>{
    try {
        
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;


        await user.remove();

        // logout user after deleting profile 
        res.cookie("token", null ,{
            expires: new Date(Date.now()),
            httpOnly: true,
        })


        // delete all posts of the user
        await Post.deleteMany({_id: {$in: posts}});

        // Removing users from followers following
        
        for(let i =0; i<following.length; i++){
            const follows = await User.findById(following[i]);
            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index,1);
            await follows.save();
        }

        // Removing users from  following's followers
        
        for(let i =0; i<followers.length; i++){
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index,1);
            await follower.save();
        }

        res.status(200).json({
            success: true,
            message: "Account deleted",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
        
    }
}

//my profile

exports.myProfile = async (req, res)=>{
    try {
        const user = await User.findById(req.user._id).populate("posts");
        res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// get user profile

exports.getUserProfile = async (req, res)=>{
    try {
        const user = await User.findById(req.params.id).populate("posts");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }
        res.status(200).json({
            success: true,
            user,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }

}

// get all users

exports.getAllUsers = async (req, res)=>{
    try {
        const users = await User.find({});
        res.status(200).json({
            success: true,
            users,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
 // forgot password

exports.forgotPassword = async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      const resetPasswordToken = user.getResetPasswordToken();
  
      await user.save();
  
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/password/reset/${resetPasswordToken}`;
  
      const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;
  
      try {
        await sendEmail({
          email: user.email,
          subject: "Reset Password",
          message,
        });
  
        res.status(200).json({
          success: true,
          message: `Email sent to ${user.email}`,
        });
      } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
  
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // reset password
  
  exports.resetPassword = async (req, res) => {
    try {
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
  
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid or has expired",
        });
      }
  
      user.password = req.body.password;
  
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Password Updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // get my post
  
  exports.getMyPosts = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const posts = [];
  
      for (let i = 0; i < user.posts.length; i++) {
        const post = await Post.findById(user.posts[i]).populate(
          "likes comments.user owner"
        );
        posts.push(post);
      }
  
      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  

// get  users post

  exports.getUserPosts = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      const posts = [];
  
      for (let i = 0; i < user.posts.length; i++) {
        const post = await Post.findById(user.posts[i]).populate(
          "likes comments.user owner"
        );
        posts.push(post);
      }
  
      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
