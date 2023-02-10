const Post = require("../models/Post")
const User = require("../models/User")


// create a post 

exports.CreatePost = async (req, res)=>{
         try{
            const newPostData = {
                caption: req.body.caption,
                image: {
                    public_id: "req.body.image.public_id",
                    url: "req.body.image.url",
                },
                owner: req.user._id,

            }
            const post = await Post.create(newPostData);
            const user = await User.findById(req.user._id);
            // user.post[user.post.length] = post._id
            user.posts.push(post._id);
            await user.save();
            
            res.status(201).json({
                success: true,
                post,
            })
         }
         catch(error){
            res.status(500).json({
                success: false,
                message: error.message,
            })
         }
}

// deletion of post

exports.DeletePost = async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: "You are not authorized to delete this post",
            })
        }

        await post.remove();
        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        })
        
        const user = await User.findById(req.user._id);
        const index = user.post.indexOf(req.params.id);
        user.post.splice(index,1);
        await user.save();
        

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    } 
}

// like and unlike post

exports.likeAndUnlikePost = async (req,res)=>{
    try {
        const post  = await Post.findById(req.params.id)

        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index,1);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post unliked",
            })
        }
        else
        {
            post.likes.push(req.user._id);
            await post.save();
            res.status(200).json({
            success: true,
            message: "Post liked",
        })
    }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// post of followings

exports.getPostOfFollowing = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const posts = await Post.find({
        owner: {
          $in: user.following,
        },
      }).populate("owner likes comments.user");
  
      res.status(200).json({
        success: true,
        posts: posts.reverse(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // update caption

  exports.updateCaption = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      if (post.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
  
      post.caption = req.body.caption;
      await post.save();
      res.status(200).json({
        success: true,
        message: "Post updated",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // add comment 

  exports.commentOnPost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      let commentIndex = -1;
  
      // Checking if comment already exists
  
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          commentIndex = index;
        }
      });
  
      if (commentIndex !== -1) {
        post.comments[commentIndex].comment = req.body.comment;
  
        await post.save();
  
        return res.status(200).json({
          success: true,
          message: "Comment Updated",
        });
      } else {
        post.comments.push({
          user: req.user._id,
          comment: req.body.comment,
        });
  
        await post.save();
        return res.status(200).json({
          success: true,
          message: "Comment added",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  // delete comment

  exports.deleteComment = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }
  
      // Checking If owner wants to delete
  
      if (post.owner.toString() === req.user._id.toString()) {
        if (req.body.commentId === undefined) {
          return res.status(400).json({
            success: false,
            message: "Comment Id is required",
          });
        }
  
        post.comments.forEach((item, index) => {
          if (item._id.toString() === req.body.commentId.toString()) {
            return post.comments.splice(index, 1);
          }
        });
  
        await post.save();
  
        return res.status(200).json({
          success: true,
          message: "Selected Comment has deleted",
        });
      } else {
        post.comments.forEach((item, index) => {
          if (item.user.toString() === req.user._id.toString()) {
            return post.comments.splice(index, 1);
          }
        });
  
        await post.save();
  
        return res.status(200).json({
          success: true,
          message: "Your Comment has deleted",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  