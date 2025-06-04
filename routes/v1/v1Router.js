const v1Router=require("express").Router();
const userRouter = require("./userRouter");
const captainRouter = require("./captainRouter");
const mapsRouter = require("./mapsRouter");
const rideRouter = require("./rideRouter");

v1Router.use("/user", userRouter);
v1Router.use("/captain", captainRouter);
v1Router.use("/maps", mapsRouter);
v1Router.use("/ride", rideRouter);

module.exports=v1Router;

