import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import  jwt from "jsonwebtoken";
import bcrypt from "bcrypt";//pass hash krne k liye

//mongo db
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
} )
.then(() => console.log("Database connected"))//agr connect hua tho ye display hoga
.catch((e)=>console.log("error"));//promise return

//schema for form
// const messageschema=new mongoose.Schema({
//     name:String,
//     email:String,
// });

// const Messge=mongoose.model("Message",messageschema)

//schema for data
const userschema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});
const User=mongoose.model("User",userschema)

const app=express();

// const users=[];//to store form info dummay dtabase

//static folder passing
//public file use krne k liye
//middleware
app.use(express.static(path.join(path.resolve(),"public")));//making public folder static so tht any folder build inside public can
                                                            //be accessed from anywhere
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//another way to make function of authentication
const isAuthenticated=async(req,res,next)=>{
    const{token}=req.cookies;
    if(token){
      const deocde=  jwt.verify(token,"PrivateKey");//agr token hai tho usko decode karo
      
        //tho fr req.user se kisi ka v data access kr skte h jiska v token hai
        req.user=await User.findById(deocde._id);//deocoded id ko uer m store

       next();
       }
       else{
        res.redirect("/login");
       }
};

app.set("view engine", "ejs");//engine specify//no need to write extensionname everywhere

// app.get("/",(req,res)=>{

// //login
// res.render("login");

//     //form
// // res.render("form");

//    // res.render("index",{name:"Ayush"});//pasing name data to index.ejs file 
//   // res.send("hi")
//         // const pathlocation=path.resolve();// current directory deta h
//         //  res.sendFile(path.join(pathlocation,"./index.html"));
//    // res.status(400).send("GAREEB");//sending multiple thng 
// //   res.json({
// //     success:true,
// //     product:[],
// //   });
// });

// app.get("/success",(req,res)=>{
    
   
//     res.render("success");
//  });
 
//for form
// app.post("/contact",async(req,res)=>{
    
// //    users.push({username:req.body.name, email:req.body.email});//dummay array m push kr rhe

//   // const messageData= ({username:req.body.name, email:req.body.email})
//    //console.log(messageData);
//    const {name,email}=req.body;
//     await Messge.create({name:name, email:email} )
//    res.redirect("success");
// });

// app.get("/add",(req,res)=>{
    
//    Messge.create({name  ,email})
//     res.send("nice")
//  });
// creating api to show collected data in users array
//  app.get("/users",(req,res)=>{
//     res.json({
//         users,
//     })
//  })


//token
 app.get ("/",isAuthenticated,(req,res)=>{
   // console.log(req.user);
    res.render("logout",{name:req.user.name});//id se nam lega aur usko logout form m pas kr dga
// //    const {token}=req.cookies; 

// //    if(token){
// //     res.render("logout");
// //    }
//    else{
//     res.render("login");
//    }
 });
//  app.get("/register",(res,req)=>{
//     res.render("register")
// })

 app.post("/login",async(req,res)=>{
    const{email,password}=req.body;

    let user=await User.findOne({email});
    if(!user){
        return  res.redirect("/register")
    }
    //hash pass kbhi match ngi hoga normal pas se iseliye niche ka line use krrhe
    const isMatch=await bcrypt.compare(password,user.password);

    

    if(!isMatch) 
    return res.render("login",{email ,message:"Incorrect Password"}//email v pass krdga mssg k sath or autofill hojaega
    );
    const token=jwt.sign({_id:user._id},"PrivateKey");//user id jo token m save hoga usko direct nhi show krskte ..isliye encode kiya gya h
   

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
     res.redirect("/"); 
 });

 app.get ("/register",(req,res)=>{
  
    res.render("register");//id se nam lega aur usko logout form m pas kr dga

 });




//register
// app.post("/register",async(req,res)=>{
//     const {name,email,password}=req.body;//req.body se name , email mil jaega
   
//     let user=await User.findOne({email})//user exist kr rha ya nhi
//     if(user){//krta hai th redirect hoga login p
//        return res.redirect("/login")
//     }

//     user= await  User.create({
//         name:name,
//         email:email,
//         password:password,
//     });

//     const token=jwt.sign({_id:user._id},"PrivateKey");//user id jo token m save hoga usko direct nhi show krskte ..isliye encode kiya gya h
   

//     res.cookie("token",token,{
//         httpOnly:true,
//         expires:new Date(Date.now()+60*1000)
//     });
//      res.redirect("/"); 
//  });
 

 //login//await use krne k liye func ko async krna jaruri hia
 app.post("/register",async(req,res)=>{
    const {name,email,password}=req.body;//req.body se name , email mil jaega
   
    let user=await User.findOne({email})
    if(user){
       return res.redirect("/login")
    }
    const hashPassword=await bcrypt.hash(password,10);//MONGODB M PASS DIKH JATA HAI ISELIYE HASH KR RHE
    user= await  User.create({
        name:name,
        email:email,
        password:hashPassword,
    });

    const token=jwt.sign({_id:user._id},"PrivateKey");//user id jo token m save hoga usko direct nhi show krskte ..isliye encode kiya gya h
   

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
     res.redirect("/"); 
 });
 app.get("/login",(req,res)=>{
    res.render("login");
 })
 
 app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    });
    res.redirect("/"); 
 });


app.listen(5000,()=>{
    console.log("Server is working")
})