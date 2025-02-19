const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(() => {
        console.log("mongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

const initDB = async () => {
    try {
        await Listing.deleteMany({}); //deletes all the documents in the collection 
        initData.data = initData.data.map((obj) => ({
            ...obj, //this is done because we need to add the owner field in the data. Owner of the listing can delete the listing.
            Owner: '67ab91a1c7d1fd0afade2d8e',
            type: obj.type && ['mountain', 'farm', 'beach', 'city', 'forest', 'villah', 'snow'].includes(obj.type) ? obj.type : 'city' // Ensure 'type' field is a valid enum value
        }));
        await Listing.insertMany(initData.data);
        console.log("data was inserted");
    } catch (err) {
        console.error("Error inserting data: ", err);
    }
};

initDB();