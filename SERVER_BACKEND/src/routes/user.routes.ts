import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.middleware";
import { deleteUser, resetPassword } from "../controllers/users.controller";

export const userRouter = express.Router();

userRouter.delete("/", verifyJWT, deleteUser);
userRouter.put("/resetPassword", verifyJWT, resetPassword);
