import express from "express";
import coockeeParser from "cookie-parser";
import authRoutes from "./api/routes/auth.routes.js"
import groupRoutes from "./api/routes/group.routes.js"
import messageRoutes from "./api/routes/message.routes.js"
import userRoutes from "./api/routes/user.routes.js"
import cors from "cors"

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true,limit:"30mb"}));
app.use(coockeeParser());
app.use(express.static("public"));

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/group",groupRoutes)
app.use("/api/v1/message",messageRoutes)
app.use("/api/v1/user",userRoutes)

app.use((err, req, res, next) => {
   res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
   });
});


export default app;