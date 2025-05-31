const userRouter = require("./userRouter");
const captainRouter = require("./captainRouter");
const mapsRouter = require("./mapsRouter");

const v1Router=require("express").Router();

v1Router.use("/user", userRouter);
v1Router.use("/captain", captainRouter);
v1Router.use("/maps", mapsRouter);

module.exports=v1Router;

