const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expresserror.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedin, reviewOwner } = require("../middleware.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        console.log("Validation error:", error.details);
        return next(new expressError(400, error.details.map(e => e.message).join(',')));
    }
    next();
};

router.post("/", isLoggedin, validateReview, wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash("success", "Created new review!");
    res.redirect(`/listings/${listing._id}`);
}));

router.delete("/:reviewId", isLoggedin, reviewOwner, wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted review");
    res.redirect(`/listings/${id}`);
}));

//reviewedit route
router.get("/:reviewId/edit", isLoggedin, reviewOwner, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const listing = await Listing.findById(id);
    const review = await Review.findById(reviewId);
    if (!listing || !review) {
        throw new expressError(404, "Listing or Review not found");
    }
    res.render("listings/review", { listing, review });
}));

router.put("/:reviewId", isLoggedin, reviewOwner, validateReview, wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findByIdAndUpdate(reviewId, req.body.review, { new: true });
    res.redirect(`/listings/${id}`);
}));

module.exports = router;