const userRouter = require("./userRouter");
const captainRouter = require("./captainRouter");

const v1Router=require("express").Router();

v1Router.use("/user", userRouter);
v1Router.use("/captain", captainRouter);

module.exports=v1Router;

