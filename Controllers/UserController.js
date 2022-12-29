import UserModel from "../Models/UserModel.js";
import bcrypt from 'bcrypt'

//get a user from database
export const getUser = async(req, res)=>{

    //fetch user Id from request
    const id = req.params.id;

    try {
        const user = await UserModel.findById(id);

        if(user){
            //remove password from response
            const {password, ...details} = user._doc
            console.log(user._doc)
            res.status(200).json(details)
        }
        else{
            res.status(404).json("User does not exist")
        }
    } 
    catch (error) {
        res.status(500).json(error)
    }
}

//update user
export const updateUser = async(req, res)=>{
    const id = req.params.id;

    //fetch data from request body
    const {currentUserId, currentUserAdminStatus, password} = req.body;

    if(id === currentUserId || currentUserAdminStatus){
        try {

            if(password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password, salt);
            }

            const user = await UserModel.findByIdAndUpdate(id, req.body, {new: true})
            res.status(200).json(user)
        } 
        catch (error) {
            res.status(500).json(error)
        }
    }
    else{
        res.status(403).json("Access Denied!!")
    }
}
//Delete user
export const deleteUser = async(req, res)=>{
    const id = req.params.id;

    const {currentUserId, currentUserAdminStatus} = req.body;

    if(currentUserId === id || currentUserAdminStatus){
        try {
            await UserModel.findByIdAndDelete(id)
            res.status(200).json("User deleted successfully")
        } 
        catch (error) {
            res.status(500).json(error) 
        }
    }
    else{
        res.status(403).json("Request Denied!, You can only delete your account")
    }
}

// Follow a User

export const followUser = async(req, res)=>{
    const id = req.params.id;

    const {currentUserId} = req.body;

    if(currentUserId === id){
        res.status(403).json("Action forbidden")
    }
    else{
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(currentUserId);

            //don't perform any functionality if currentUserId is already in the followers of followerUser
            if(!followUser.followers.includes(currentUserId)){

                await followUser.updateOne({$push: {followers: currentUserId}});
                await followingUser.updateOne({$push: {following: id}});
                res.status(200).json("User followed")
            }
            else{
                res.status(403).json("Already following");
            }
        } 
        catch (error) {
            res.status(500).json(error) 
        }
    }
}
//un-follow a User
export const unFollowUser = async(req, res)=>{
    const id = req.params.id;

    const {currentUserId} = req.body;

    if(currentUserId === id){
        res.status(403).json("Action forbidden")
    }
    else{
        try {
            const followUser = await UserModel.findById(id);
            const followingUser = await UserModel.findById(currentUserId);

            //don't perform any functionality if currentUserId is already in the followers of followerUser
            if(followUser.followers.includes(currentUserId)){

                await followUser.updateOne({$pull: {followers: currentUserId}});
                await followingUser.updateOne({$pull: {following: id}});
                res.status(200).json("User Unfollowed")
            }
            else{
                res.status(403).json("User is not followed by you");
            }
        } 
        catch (error) {
            res.status(500).json(error) 
        }
    }
}
