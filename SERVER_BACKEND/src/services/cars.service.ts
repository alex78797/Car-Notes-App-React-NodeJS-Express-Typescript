import { pool } from "../config/postgreSQL.config";
import { ICar } from "../models/models";

/**
 * Writes the sql code that creates a car with the input given by the user and saves it to the database.
 */
export async function createCarDB(
  userId: string,
  brand: string,
  model: string,
  fuel: string
) {
  // `$1` is a placeholder for the actual value which is to be inserted.
  // Placeholders help (or might help) prevent sql injections.
  // Add `RETURNING *` to return the data inserted in the database
  // (or in other cases: the data updated or deleted from the database).
  const sqlQuery =
    'INSERT INTO "cars" ("brand", "model", "fuel", "userId") VALUES ($1, $2, $3, $4) RETURNING *';
  const createdCar = await pool.query(sqlQuery, [brand, model, fuel, userId]);
  // The result of the query is put in an array. Here we have only the todo we created, (the first one in the list).
  return createdCar.rows[0];
}

/**
 * SQL code that returns all the car notes of the user with the given id from the database.
 * The car notes are ordered in reverse order based on their date
 * (newest car note will be the first in the list, oldest/latest car note will be the last in the list)
 * @param userId the id of the user.
 * @returns
 */
export async function getAllCarsDB(userId: string): Promise<ICar[]> {
  const sqlQuery =
    'SELECT * FROM "cars" WHERE "userId" = $1 ORDER BY "createdAt" DESC';
  const allCars = await pool.query(sqlQuery, [userId]);
  return allCars.rows;
}

/**
 * SQL code that returns all the car with the given car id belonging to the user with the given id.
 * @param userId the id of the user.
 * @param carId the id of the car.
 * @returns
 */
export async function getCarDB(userId: string, carId: string): Promise<ICar> {
  const sqlQuery = 'SELECT * FROM "cars" WHERE "userId" = $1 AND "carId" = $2';
  const car = await pool.query(sqlQuery, [userId, carId]);
  return car.rows[0];
}

/**
 * SQL code that updates the car note with the given id with
 * the properties (here brand, model and fuel) provided by the user.
 *
 * @param carId
 * @param userId
 * @param brand
 * @param model
 * @param fuel
 */
export async function updateCarDB(
  carId: string,
  userId: string,
  brand: string,
  model: string,
  fuel: string
) {
  const sqlQuery =
    'UPDATE "cars" SET "brand" = $1, "model" = $2, "fuel" = $3 WHERE "carId" = $4 AND "userId" = $5';
  await pool.query(sqlQuery, [brand, model, fuel, carId, userId]);
}

/**
 * SQL code that deletes the car with the given id from the database.
 * @param carId
 * @param userId
 */
export async function deleteCarDB(carId: string, userId: string) {
  const sqlQuery = 'DELETE FROM "cars" WHERE "carId" = $1 AND "userId" = $2';
  await pool.query(sqlQuery, [carId, userId]);
}

/**
 * SQL code that retreives all cars from the db.
 * Method does not check who the car belongs to (i.e. what the userId of the car is).
 * @returns
 */
export async function getAllCarsAdminPriviledgeDB(): Promise<ICar[]> {
  const sqlQuery = 'SELECT * FROM "cars" ORDER BY "createdAt" DESC';
  const allCars = await pool.query(sqlQuery);
  return allCars.rows;
}

/**
 * SQL code that deletes a car with a particular carId from the db.
 * Method does not check who the car belongs to (i.e. what the userId of the car is).
 * @param carId
 */
export async function deleteCarForAdminPriviledgeDB(
  carId: string
): Promise<void> {
  const sqlQuery = 'DELETE FROM "cars" WHERE "carId" = $1';
  await pool.query(sqlQuery, [carId]);
}

