import express from "express";
import {
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  getCar,
  getAllCarsAdminPriviledge,
  deleteCarForAdminPriviledge,
} from "../controllers/cars.controller";
import { verifyJWT } from "../middleware/verifyJWT.middleware";
import { verifyAdmin } from "../middleware/verifyRoles.middleware";

export const carRouter = express.Router();

// We want to protect all these routes. Authorization required for all these routes.
carRouter.use(verifyJWT);

carRouter.post("/", createCar);
carRouter.get("/", getAllCars);
carRouter.get("/:carId", getCar);
carRouter.put("/:carId", updateCar);
carRouter.delete("/:carId", deleteCar);

// this routed are accessible only to authorized/authenticated users, which are also admins.
carRouter.get("/admin", verifyAdmin, getAllCarsAdminPriviledge);
carRouter.delete("/admin/:carId", verifyAdmin, deleteCarForAdminPriviledge);

// If we want to protect a particular route, for example:
// carRouter.post("/", verifyJWT, createCar);
// carRouter.get("/", verifyJWT, verifyAdmin, getAllCarsAdminPriviledge);
