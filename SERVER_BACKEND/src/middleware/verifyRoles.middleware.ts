import { NextFunction, Response } from "express";
import { UserRequest } from "../models/models";

/**
 * Function, which verifies it the user making the request is also an admin.
 * This function must come right after the verifyJWT middleware!
 * @param req
 * @param res
 * @param next
 * @returns
 */
export function verifyAdmin(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.userRoles.includes("admin")) {
    return res.sendStatus(401);
  }
  next();
}
