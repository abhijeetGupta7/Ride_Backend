const userRouter = require("./userRouter");

const v1Router=require("express").Router();

v1Router.use("/user", userRouter);

module.exports=v1Router;

