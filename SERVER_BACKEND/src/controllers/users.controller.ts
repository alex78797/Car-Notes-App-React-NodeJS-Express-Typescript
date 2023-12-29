import { Response, NextFunction } from "express";
import { UserRequest } from "../models/models";
import { sanitizeUserInput } from "../utils/sanitizeUserInput";
import { deleteUserDB, resetPasswordDB } from "../services/users.service";
import { getUserByIdDB } from "../services/auth.service";
import bcrypt from "bcryptjs";
import validator from "validator";

/**
 * @route DELETE /api/users/
 * @description Deletes the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function deleteUser(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userInput = sanitizeUserInput(req.body) as { userPassword: string };
    const user = await getUserByIdDB(req.userId);

    const passwordsMatch: boolean = bcrypt.compareSync(
      userInput.userPassword,
      user.password
    );

    if (!passwordsMatch) {
      return res.status(401).json({ error: "Wrong passoword!" });
    }

    await deleteUserDB(req.userId);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

/**
 * @route PUT /api/users/resetPassword
 * @description Deletes the user making the request, from the database.
 * @access private the user must be authorized to access this route.
 */
export async function resetPassword(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userInput = sanitizeUserInput(req.body) as {
      oldPassword: string;
      newPassword: string;
      newPasswordConfirm: string;
    };

    if (
      !userInput.oldPassword ||
      userInput.oldPassword === "" ||
      !userInput.newPassword ||
      userInput.newPassword === "" ||
      !userInput.newPasswordConfirm ||
      userInput.newPasswordConfirm === ""
    ) {
      return res
        .status(401)
        .json({ error: "A field is missing! Please enter all fields!" });
    }

    const user = await getUserByIdDB(req.userId);
    const oldPasswordsMatch = bcrypt.compareSync(
      userInput.oldPassword,
      user.password
    );

    if (!oldPasswordsMatch) {
      return res.status(401).json({ error: "Old password is wrong!" });
    }

    if (userInput.newPassword !== userInput.newPasswordConfirm) {
      return res.status(401).json({
        error: "The new password and the confirmed password do not match!",
      });
    }

    if (userInput.newPassword.length < 12) {
      return res.status(400).json({
        error: "Password must contain at least 12 characters!",
      });
    }

    if (!validator.isStrongPassword(userInput.newPassword)) {
      return res.status(400).json({
        error:
          "Password must include small letters, capital letters, numbers and special characters!",
      });
    }

    const salt: string = await bcrypt.genSalt(12);
    const hashedPassword: string = await bcrypt.hash(
      userInput.newPassword,
      salt
    );

    await resetPasswordDB(hashedPassword, [], req.userId);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
