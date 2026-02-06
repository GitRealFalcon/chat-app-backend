import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DBConnect = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}${DB_NAME}`)
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export default DBConnect;