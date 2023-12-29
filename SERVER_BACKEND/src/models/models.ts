import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

/**
 * The properties of a car
 */
export interface ICar {
  carId: string;
  userId: string;
  brand: string;
  model: string;
  fuel: string;
  createdAt: string;
}

/**
 * The properties of a User
 */
export interface IUser {
  userId: string;
  email: string;
  password: string;
  userName: string;
  roles: string[];
  refreshTokens: string[];
  createdAt: string;
}

/**
 * Extends the JwtPayload interface with the properties of the user signed/encrypted by the access token and refresh token
 */
export interface UserJwtPayload extends JwtPayload {
  userId: string;
  userRoles: string[];
}

/**
 * Properties of a request made by a user.
 * Extends the Request interface/object from express by adding
 * the id and the roles of the user making the request
 * to the Request object.
 */
export interface UserRequest extends Request {
  userId: string;
  userRoles: string[];
}
