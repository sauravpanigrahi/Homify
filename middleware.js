const Listing = require("./models/listing");
const Review = require('./models/review');

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  //req.originalUrl is the url from which the request came from
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => { //middleware to save the redirect url .after login the user will be redirected to the page from where he came from. and not to the default page. also the redirect url is saved in the session data. important to note that the redirect url is saved in the session data and not in the request object.
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {    
    const {id}=req.params;
    const listing=await Listing.findById(id);
    if (!listing.Owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not authorized to edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
module.exports.reviewOwner = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId).populate('author');

  
    // Ensure the logged-in user is the author of the review
    if (! review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not  authorized to edit or delete this review");
        return res.redirect(`/listings/${id}`);
    }

    // If the logged-in user is the author, continue with the next middleware or action (update/delete)
    next();
};
