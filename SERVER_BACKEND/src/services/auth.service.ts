import { pool } from "../config/postgreSQL.config";
import { IUser } from "../models/models";

export async function getUserByEmailDB(email: string): Promise<IUser> {
  const sqlQuery = 'SELECT * FROM "users" WHERE "email" = $1';
  const user = await pool.query(sqlQuery, [email]);
  return user.rows[0];
}

export async function updateUserRefreshTokensDB(
  refreshTokens: string[],
  userId: string
): Promise<void> {
  const sqlQuery =
    'UPDATE "users" SET "refreshTokens" = $1 WHERE "userId" = $2';
  await pool.query(sqlQuery, [refreshTokens, userId]);
}

export async function saveUserDB(
  userName: string,
  email: string,
  passoword: string
): Promise<void> {
  const sqlQuery =
    'INSERT INTO "users" ("userName", "email", "password") VALUES ($1, $2, $3)';
  await pool.query(sqlQuery, [userName, email, passoword]);
}

export async function getUserByRefreshTokenDB(
  refreshToken: string
): Promise<IUser> {
  const sqlQuery = 'SELECT * FROM "users" WHERE $1 =  ANY("refreshTokens")';
  const user = await pool.query(sqlQuery, [refreshToken]);
  return user.rows[0];
}

export async function getUserByIdDB(userId: string): Promise<IUser> {
  const sqlQuery = 'SELECT * FROM "users" WHERE "userId" = $1';
  const user = await pool.query(sqlQuery, [userId]);
  return user.rows[0];
}
