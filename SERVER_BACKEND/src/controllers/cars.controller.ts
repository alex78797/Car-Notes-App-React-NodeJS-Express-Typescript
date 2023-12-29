import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../models/models";
import {
  createCarDB,
  deleteCarDB,
  deleteCarForAdminPriviledgeDB,
  getAllCarsAdminPriviledgeDB,
  getAllCarsDB,
  getCarDB,
  updateCarDB,
} from "../services/cars.service";
import { sanitizeUserInput } from "../utils/sanitizeUserInput";
import validator from "validator";

/**
 * @route POST /api/cars
 * @description Creates a new car with the input given by the user and saves the car note to the database
 */
export async function createCar(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // get the user input from the body of the request and sanitize it
    const userInput = sanitizeUserInput(req.body) as {
      brand: string;
      model: string;
      fuel: string;
    };

    const { brand, model, fuel } = userInput;

    // check that the user did enter all required properties
    const emptyFields: string[] = [];
    if (!brand) {
      emptyFields.push("brand");
    }
    if (!model) {
      emptyFields.push("model");
    }
    if (!fuel) {
      emptyFields.push("fuel");
    }

    if (emptyFields.length > 0) {
      return res
        .status(400)
        .json({ error: "Please fill in all the fields", emptyFields });
    }

    // create the car. the car belongs to the user making the request. The req.userId comes from the verifyJWT middleware.
    const createdCar = await createCarDB(req.userId, brand, model, fuel);
    return res.status(200).json(createdCar);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}

/**
 * @route GET /api/cars
 * @description Returns all the cars of  the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function getAllCars(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const allCars = await getAllCarsDB(req.userId);
    const filters = req.query;

    const filteredCars = [];

    for (const car of allCars) {
      let isValid = true;
      for (const key in filters) {
        if (key === "brand") {
          let containsBrand = false;
          const filterValues = filters[key].toString().split("-");
          for (const filter of filterValues) {
            if (car.brand.includes(filter)) {
              containsBrand = true;
              break;
            }
          }
          isValid = isValid && containsBrand;
        }
        if (key === "fuel") {
          let containsFuel = false;
          const filterValues = filters[key].toString().split("-");
          for (const filter of filterValues) {
            if (car.fuel.includes(filter)) {
              containsFuel = true;
              break;
            }
          }
          isValid = isValid && containsFuel;
        }
      }
      // isValid is TRUE in one of the following cases:
      //   1) the car object satisfies ALL QUERY CONDITIONS  --->  add the car object to the filteredCars list
      //   2) there are NO QUERY CONDITIONS (filter list is empty). In this case, all cars are added to the filteredCars list.
      if (isValid) {
        filteredCars.push(car);
      }
    }

    return res.status(200).json(filteredCars);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}

/**
 * @route GET /api/cars/admin
 * @description Returns all the cars of  the user making the request, from the database.
 * @access private the user must be an admin to access this route.
 */
export async function getAllCarsAdminPriviledge(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const allCars = await getAllCarsAdminPriviledgeDB();

    const filters = req.query;

    const filteredCars = [];

    for (const car of allCars) {
      let isValid = true;
      for (const key in filters) {
        if (key === "brand") {
          let containsBrand = false;
          const filterValues = filters[key].toString().split("-");
          for (const filter of filterValues) {
            if (car.brand.includes(filter)) {
              containsBrand = true;
              break;
            }
          }
          isValid = isValid && containsBrand;
        }
        if (key === "fuel") {
          let containsFuel = false;
          const filterValues = filters[key].toString().split("-");
          for (const filter of filterValues) {
            if (car.fuel.includes(filter)) {
              containsFuel = true;
              break;
            }
          }
          isValid = isValid && containsFuel;
        }
      }
      // isValid is TRUE in one of the following cases:
      //   1) the car object satisfies ALL QUERY CONDITIONS  --->  add the car object to the filteredCars list
      //   2) there are NO QUERY CONDITIONS (filter list is empty). In this case, all cars are added to the filteredCars list.
      if (isValid) {
        filteredCars.push(car);
      }
    }

    return res.status(200).json(filteredCars);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}

/**
 * @route GET /api/cars/:carId
 * @description Returns all the cars of  the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function getCar(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // get the car id from the parameters of the request and validate it (the carId parameter is defined in cars.routes.ts)
    const carId = req.params.carId;
    if (!validator.isUUID(carId)) {
      return res.status(400).json({ error: "Invalid id type!" });
    }
    // get a particular car note, created by the current user (the user making the request), from the db. The req.userId comes from the verifyJWT middleware.
    const car = await getCarDB(req.userId, carId);
    return res.status(200).json(car);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}

/**
 * @route PUT /api/cars/:carId
 * @description Updates the car with the given id, of the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function updateCar(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // get the car id from the parameters of the request and validate it (the carId parameter is defined in cars.routes.ts)
    const carId: string = req.params.carId;
    if (!validator.isUUID(carId)) {
      return res.status(400).json({ error: "Invalid id type!" });
    }
    // get the user input and sanitize it
    const userInput = sanitizeUserInput(req.body) as {
      brand: string;
      model: string;
      fuel: string;
    };

    const { brand, model, fuel } = userInput;

    // check if the user entered all required fields
    const emptyFields: string[] = [];
    if (!brand) {
      emptyFields.push("brand");
    }
    if (!model) {
      emptyFields.push("model");
    }
    if (!fuel) {
      emptyFields.push("fuel");
    }

    if (emptyFields.length > 0) {
      return res
        .status(400)
        .json({ error: "Please fill in all the fields", emptyFields });
    }

    // update the car in the database. The req.userId comes from the verifyJWT middleware.
    await updateCarDB(carId, req.userId, brand, model, fuel);
    return res.sendStatus(204);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}

/**
 * @route DELETE /api/cars/:carId
 * @description Deletes the car with the given id, of the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function deleteCar(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // get the car id from the parameters of the request and validate it (the carId parameter is defined in cars.routes.ts)
    const carId: string = req.params.carId;
    if (!validator.isUUID(carId)) {
      return res.status(400).json({ error: "Invalid id type!" });
    }
    // delete this car, of the user making the request, from the db. The req.userId comes from the verifyJWT middleware.
    await deleteCarDB(carId, req.userId);
    return res.sendStatus(204);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}

/**
 * @route DELETE /api/cars/admin/:carId
 * @description Deletes the car with the given id, of the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function deleteCarForAdminPriviledge(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // get the car id from the parameters of the request and validate it (the carId parameter is defined in cars.routes.ts)
    const carId: string = req.params.carId;
    if (!validator.isUUID(carId)) {
      return res.status(400).json({ error: "Invalid id type!" });
    }
    // delete this car from the db.
    await deleteCarForAdminPriviledgeDB(carId);
    return res.sendStatus(204);
  } catch (error) {
    // This uses the errorHandler middleware. It logs the error to the screen, (it logs it to a file),
    // returns a status code 500 and sends to the client the message `Did not complete action! An unexpected error occured!`.
    next(error);
  }
}
