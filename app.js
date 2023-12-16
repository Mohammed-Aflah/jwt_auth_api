const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require('dotenv').config()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const posts = [
  {
    username: "aflu",
    title: "post1",
  },
  {
    username: "john",
    title: "post2",
  },
];
app.get("/posts",authenticateToken, (req, res) => {
  console.log("api called ");
  console.log('user in post get',req.user);
  res.json(posts);
});
app.post("/login", (req, res) => {
  // Authenticate the User

  console.log(req.body,' data of use');
  const uesrname = req.body.username;
  const user = { uesrname };
  const accesToken=jwt.sign(user,process.env.TOKEN_SECRET);
  res.json({accesToken})
});
function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization']
    console.log(authHeader,' auth header')
    const token=authHeader && authHeader.split(' ')[1]
    console.log(token,' token');

    jwt.verify(token,process.env.TOKEN_SECRET,(err,user)=>{
        if(err) return res.status(403).send("Authentication Failed")

        console.log(user,' this use object');
        req.user=user
        next()
    })
}

app.listen(5001, () => {
  console.log("app started http://localhost:5001");
});
