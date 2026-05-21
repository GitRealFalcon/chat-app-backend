import mongoose from "mongoose";
import "./env.js";
import { DB_NAME } from "../constants.js";

const DBConnect = async ()=>{
    try {
        const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL

        if (!mongoURI) {
            throw new Error("MONGO_URI or MONGO_URL is not configured");
        }

        const connectionString = mongoURI.endsWith("/")
            ? `${mongoURI}${DB_NAME}`
            : mongoURI.includes("/" ) && mongoURI.startsWith("mongodb")
              ? mongoURI
              : `${mongoURI}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(connectionString)
        console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}

export default DBConnect;