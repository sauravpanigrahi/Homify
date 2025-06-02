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

// Session configuration
const secret = process.env.SECRET || 'thisisasecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // time period in seconds
    crypto: {
        secret: secret
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(Flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set user data for all routes
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
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
