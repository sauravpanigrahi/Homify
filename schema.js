const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("",null),
        location: Joi.string().required(),
        description: Joi.string().required(),
        country: Joi.string().required(),
        type: Joi.string().valid('mountain', 'beach', 'city', 'forest','rooms','island','iconic cities','castles','amazing pools','camping','farms','arctic','historical homes','domes','boats').required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});