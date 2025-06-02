if(process.env.NODE_ENV!="production"){
    require('dotenv').config()          //This line indicates that when we deploy or upload the file, the .env file is not uploaded or deployed
}

// console.log(process.env.SECRET) 

const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const mongoose=require("mongoose");
const methodoverride=require("method-override");
// const Listing=require("./models/listing");
const ejsMate=require("ejs-mate");
// const wrapAsync=require("./utils/wrapAsync.js");
const expressError=require("./utils/expresserror.js");
// const {listingSchema, reviewSchema}=require("./schema.js"); // Ensure reviewSchema is imported
// const Review = require('./models/review');
const session=require("express-session");
const MongoStore = require('connect-mongo');
const Flash=require("connect-flash"); 
const passport=require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User=require("./models/user.js");


//for routes module
const listingsRouter=require("./routes/listing");
const reviewsRouter=require("./routes/review")
const userRouter=require("./routes/user.js");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method")); //when we edit a form we need to use method override
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const dbUrl=process.env.ATLASDB_URL;

// MongoDB Connection with error handling
async function main(){
    try {
        await mongoose.connect(dbUrl);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit if cannot connect to database
    }
}

main();

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET || "my secretcode"
    },
    touchAfter:24*3600,
});

store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE:", err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET || "my secretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions)); //express-session is used to store the session data in the cookie.
app.use(Flash());        //express-flash is used to store the flash messages in the session data, and then they are removed from the session data and added to the response object as locals.

app.use(passport.initialize());  //it used as middleware to initialize the passport
app.use(passport.session());    //it is used as middleware to maintain the session. A web application needs the ability to identify user as they browse from page to page. this session of request and response each associated with the same user,is know as a session. basically a user dont need to logic multiple times on the same website of diferent pages.
passport.use(new LocalStrategy(User.authenticate()));  //passport-local-mongoose provides a authenticate method to the user model. all the request from user are authenticated by local strategy by  function authenticating of passport-local-mongoose.
passport.serializeUser(User.serializeUser());   //used for serializing the user for the session. it is used to store the user id in the session data.
passport.deserializeUser(User.deserializeUser()); //used for deserializing the user for the session. it is used to get the user id from the session data and get the user data from the database.

app.use((req, res, next) => {
    res.locals.currUser = req.user;  
    res.locals.success = req.flash("success");     // res.locals is an object that contains response local variables scoped to the request, and therefore available only to the view(s) rendered during that request/response cycle. express-session is used to store the session data in the cookie.
    res.locals.error = req.flash("error"); 
    next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.get("/",(req,res)=>{
    res.redirect("/listings");
 });

app.all("*", (req, res, next) => {
    next(new expressError(404, "Page not found"));
});
// app.get("/demouser",async(req,res)=>{
// let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"student",
// });
// let registerUser=await User.register(fakeUser,"helloworld");   //"helloworld"---- password
// res.send(registerUser);
// })

 
app.all("*", (req, res, next) => {
    next(new expressError(404, "Page not found"));
});
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    let { status = 500, msg = "Something went wrong" } = err;
    res.status(status).render("listings/error.ejs", { msg });
});
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});
