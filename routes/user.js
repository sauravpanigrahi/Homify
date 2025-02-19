const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport"); 
const {saveRedirectUrl}=require("../middleware");

router.get("/signup",(req,res)=>{
    res.render("users/signup");
})
router.post("/signup",wrapAsync(async(req,res)=>{
   try{ let{username,email,password}=req.body;
    let newUser=new User({username,email});
    const registerdUser=await User.register(newUser,password);
   req.login(registerdUser,(err)=>{
    if(err){
        return next(err);
    }
    req.flash("success","Welcome to Wanderlust");   //flash message
    res.redirect("/listings"); //redirecting to the listings page   
})  
}catch(err){
        req.flash("error","User already exists");
        // res.send(err);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})
router.post("/login",saveRedirectUrl, passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
req.flash("success","Login successful");
res.redirect(res.locals.redirectUrl || "/listings");
});


router.get("/logout",(req,res)=>{
req.logout((err)=>{
    if(err){
      return  next(err);
    }
    req.flash("success","Successfully logged out");
    res.redirect("/listings");

});


});

module.exports = router;