 function wrapAsync(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(next);  // Catch async errors and pass them to the next middleware
    };
};
module.exports= wrapAsync;// utils/wrapAsync.js

