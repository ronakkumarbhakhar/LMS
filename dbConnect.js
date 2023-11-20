import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect("mongodb+srv://rk8875636542:ronakmongodb@cluster0.djgm2ef.mongodb.net/");
        console.log("MongoDB connection established");
    } catch (err) {
        console.log("MongoDB connection error:", err);
    }
}

export default dbConnect;