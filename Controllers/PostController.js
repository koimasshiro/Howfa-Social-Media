import mongoose from "mongoose";
import PostModel from "../Models/PostModel.js";
import UserModel from '../Models/UserModel.js'

//create new post
export const createPost = async(req, res)=>{
    const newPost = new PostModel(req.body);

    try {
        await newPost.save()
        res.status(200).json("Posted")
    } 
    catch (error) {
       res.status(500).json(error) 
    }
}

//Get a post
export const getPost = async(req, res)=>{
    const id = req.params.id;

    try {
        const post = await PostModel.findById(id);
        res.status(200).json(post)
    } 
    catch (error) {
        res.status(500).json(error);
    }
}

//update a post

export const updatePost = async(req, res)=>{
    const postId = req.params.id;

    //fetch user id from body of request
    const {userId} = req.body;

    try {
        const post = await PostModel.findById(postId);

        if(post.userId === userId){
            await post.updateOne({ $set: req.body });
            res.status(200).json("Post updated successfully!")
        }
        else{
            res.status(403).json("Action forbidden");
        }
    } 
    catch (error) {
        res.status(500).json(error);
    }
}

//delete post

export const deletePost = async(req, res)=>{
    const id = req.params.id;
    const {userId} = req.body;

    try {
        const post = await PostModel.findById(id);

        if(post.userId === userId){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully");
        }
        else{
            res.status(403).json("Action forbidden");
        }
    } 
    catch (error) {
        res.status(500).json(error);
    }
}

//like and Unlike a post

export const likePost = async(req, res)=>{
    const id = req.params.id;
    const {userId} = req.body;

    try {
        const post =await PostModel.findById(id);

        if (!post.likes.includes(userId)){
            await post.updateOne({$push: {likes: userId}});
            res.status(200).json("Liked");
        }
        else{
            await post.updateOne({$pull: {likes: userId}});
            res.status(200).json("Unliked");
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
}

//Get Timeline of post

export const getTimeline = async(req, res)=>{
    const userId = req.params.id;
    
    try {
        const currentUserPost = await PostModel.find({userId: userId});
        const followingPost = await UserModel.aggregate([
            {
                $match: {
                    _id : new mongoose.Types.ObjectId(userId)
                }
        },{
            $lookup: {
                from : "posts",
                localField: "following",
                foreignField: "userId",
                as: "followingPost"
            }
        },
        {
            $project: {
                followingPost: 1,
                _id: 0
            }
        }
    ])
    res.status(200).json(currentUserPost.concat(...followingPost[0].followingPost)

    //make posts appear in timeline according to latest posts
    .sort((a, b)=>{
        return b.createdAt - a.createdAt;
    })
    );
    } 
    catch (error) {
        res.status(500).json(error);
    }
}