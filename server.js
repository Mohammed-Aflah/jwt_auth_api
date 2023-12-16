const express = require("express");
const mongoose = require("mongoose");
const bcrypt=require('bcrypt')
const data=require('./data/posts')
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('cookie-parser')())
const jwt = require("jsonwebtoken");
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("data base connection is Ok ");
});
const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String },
});
const User=mongoose.model('User',userSchema)

app.post('/signup',async(req,res)=>{
    try{
        let {username,password}=req.body
        password=bcrypt.hashSync(password,10)
        const userdata=new User({username,password})
        await userdata.save()
        console.log(JSON.stringify(userdata));
        const token=jwt.sign({id:userdata._id,username:userdata.username},process.env.TOKEN_SECRET,{expiresIn:"1h"})

        console.log(token,' in signup');
        res.cookie('token',token,{httpOnly:true})
        res.json({message:"User Registration Success!!"}).status(201)
    }catch(err){
        res.json({error:err.message}).status(500)
    }

})

app.post('/login',async(req,res)=>{
    try{
        let {username,password}=req.body
        const user=await User.findOne({username})
        if(!user){
            res.json({message:"user not found"}).status(401)
        }
        const isCorrectPass=bcrypt.compare(password,user.password)
        if(!isCorrectPass){
            res.json({message:"invalide username or password"})
        }
        const token=jwt.sign({id:user._id,username},process.env.TOKEN_SECRET,{expiresIn:"1h"})
        res.json({token})
    }catch(err){
        console.log('Error in login ->',err);
        res.json({error:err.message}).status(500)
    }

})
app.post('/logout',(req,res)=>{
    res.cookie('token','',{expires:new Date(0),httpOnly:true})
    res.json({message:"logut successfull!!!"})
})
function authenticateToken(req,res,next){
    console.log(JSON.stringify(req.cookies));
    const token=req?.cookies?.token
    if(!token){
        return res.json({message:"Unautherized please login first!!"}).status(401)
    }
    jwt.verify(token,process.env.TOKEN_SECRET,(err,user)=>{
        if(err){
            return res.status(403).json({message:"invalide token"})
        }
        req.user=user
        next()
    })
}
app.get('/posts',authenticateToken,(req,res)=>{
    res.send(data.posts)
})
app.listen(process.env.PORT_NUMBER,()=>{
    console.log('app started in http://localhost:4001');
})