import express from "express";
import coockeeParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true,limit:"30mb"}));
app.use(coockeeParser());
app.use(express.static("public"));

export default app;