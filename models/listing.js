const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image: {
        url: String,
        filename: String,
      },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    Owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    
        type: {
            type: String,
            enum: ['mountain', 'beach', 'city', 'forest', 'rooms', 'island', 'iconic cities', 'castles', 'amazing pools', 'camping', 'farms', 'arctic', 'historical homes', 'domes', 'boats'],
            required: true
        

       
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;