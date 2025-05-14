const express = require('express');
const apiRouter = require('./routes/apiRouter.routes');
const cors=require("cors");

const app=express();

// Global Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());

app.use("/api",apiRouter);


module.exports=app;