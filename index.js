import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';

const app = express();

// middleware

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

dotenv.config()

//connect mongoDB
mongoose
  .connect(
    process.env.MONGO_DB,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .then(() => app.listen(process.env.PORT, () => console.log("Server is running!!")))
  .catch((error)=>console.log(error));

  //routes usage
app.use('/auth', AuthRoute)
app.use('/user', UserRoute)
app.use('/post', PostRoute)