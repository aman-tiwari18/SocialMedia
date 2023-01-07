const User = require("../models/User")

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