const express = require('express');
const apiRouter = require('./routes/apiRouter.routes');
const cors=require("cors");
const cookieParser = require('cookie-parser');

const app=express();

// Global Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());
app.use(cookieParser());

app.use("/api",apiRouter);


module.exports=app;