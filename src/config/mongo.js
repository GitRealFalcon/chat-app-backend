import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DBConnect = async ()=>{
    try {
        const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL
        const connectionInstance = await mongoose.connect(`${mongoURI}${DB_NAME}`)
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export default DBConnect;