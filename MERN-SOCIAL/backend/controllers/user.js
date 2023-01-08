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