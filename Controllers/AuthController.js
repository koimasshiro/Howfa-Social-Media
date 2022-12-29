import UserModel from "../Models/UserModel.js";
import bcrypt from 'bcrypt';

//registering a new user
export const registerUser = async(req, res)=>{

    //encrypting user password

    //make a salt from bcrypt lib with a value of 10
    const salt = await bcrypt.genSalt(10);

    //add salt to password
    const hashpass = await bcrypt.hash(password, salt)
    req.body.password = hashpass;

    //map data to UserModel
    const newUser =new UserModel(req.body);
    const {username} = req.body;

    try {
        const oldUser = await UserModel.findOne({username});

        if(oldUser){
            return res.status(400).json("username is already registered")
        }
        await newUser.save()
        res.status(200).json(newUser)
    } 
    catch (error) {
        res.status(500).json({message: error.message})
    }

};

//logging user
export const loginUser = async(req, res)=>{
    const {username, password} = req.body;

    //find user in database
    try {
        const user = await UserModel.findOne({username: username});

        if(user){
            const validity = await bcrypt.compare(password, user.password);

            validity ? res.status(200).json(user) : res.status(400).json("Wrong Password");
        }
        else{
            res.status(404).json('User does not exist')
        }
    } 
    catch (error) {
        res.status(500).json({message: error.message});
    }
}