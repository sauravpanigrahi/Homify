const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expresserror.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isOwner } = require("../middleware.js");
const multer  = require('multer') //for upload files
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    if (!req.body.listing) {
        return next(new expressError(400, '"listing" is required'));
    }
    console.log("Received body:", req.body); // Add this line
    const { error } = listingSchema.validate(req.body);
    if (error) {
        console.log("Validation error:", error.details);
        return next(new expressError(400, error.details.map(e => e.message).join(',')));
    }
    next();
};

//new route
router.get("/new", isLoggedin, (req, res) => {
    res.render("listings/new.ejs");
});
router.get("/filter", async (req, res) => {
    try {
        console.log("Query parameters:", req.query.type); // Debugging statement
        let filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
            console.log("Type filter applied:", filter.type); // Added debugging statement
        } 
      
        // Add more filters as needed
        console.log("Filter object:", filter);
        const filterListing = await Listing.find(filter);
        // console.log("Filtered Listings:", filterListing);
        res.render("listings/filter", { filterListing });
    } catch (error) {
        console.error("Error fetching filtered listings:", error); // Corrected variable name
        res.status(500).send("Internal Server Error");
    }
});

router.route("/")
    .get(wrapAsync(async (req, res, next) => {
        const listings = await Listing.find({});
        res.render("listings/index.ejs", { listings });
    }))
    .post(isLoggedin, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res, next) => {
        let url = req.file.path;
        let filename = req.file.filename;
        const listing = new Listing(req.body.listing);
        listing.Owner = req.user._id;
        listing.image = { url, filename };
        await listing.save();
        req.flash("success", "Successfully made a new listing!");
        res.redirect(`/listings/${listing._id}`);
    }));

router.route("/:id")
    .get(wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author"
                }
            })
            .populate('Owner');
        if (!listing) {
            req.flash("error", "Listing doesn't exist");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    }))
    .put(isLoggedin, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        req.flash("success", "Successfully updated listing");
        res.redirect(`/listings/${id}`);
    }))
    .delete(isLoggedin, isOwner, wrapAsync(async (req, res, next) => {
        const { id } = req.params;
        const listing = await Listing.findByIdAndDelete(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        req.flash("success", "Listing Deleted");
        res.redirect("/listings");
    }));

router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

router.get("/filter", (req, res) => {
    res.render("listings/filter.ejs");
});

module.exports = router;