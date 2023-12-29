import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import {
  getUserByRefreshTokenDB,
  getUserByEmailDB,
  saveUserDB,
  updateUserRefreshTokensDB,
  getUserByIdDB,
} from "../services/auth.service";
import { sanitizeUserInput } from "../utils/sanitizeUserInput";
import { IUser, UserJwtPayload, UserRequest } from "../models/models";
import jwt from "jsonwebtoken";

/**
 * @description Registers a user
 * @route POST /api/auth/register
 * @access public user does not have to be authorized in to access the route.
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // get email and password from the user
    const userInput = sanitizeUserInput(req.body) as {
      email: string;
      password: string;
      confirmPassword: string;
      userName: string;
    };

    const { email, password, confirmPassword, userName } = userInput;

    if (!email) {
      return res.status(400).json({ error: "Email is mandatory!" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is mandatory!" });
    }

    if (!confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password confirmation is mandatory!" });
    }

    if (!userName) {
      return res.status(400).json({ error: "Username is mandatory!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }

    // validate email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email is not valid!" });
    }

    // validator packages accepts passwords with at least 8 characters.
    // -> A stronger requirement: password must contain at least 12 characters
    if (password.length < 12) {
      return res
        .status(400)
        .json({ error: "Password must contain at least 12 characters!" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must include small letters, capital letters, numbers and special characters!",
      });
    }

    const emailAlreadyExists = await getUserByEmailDB(email);
    if (emailAlreadyExists) {
      return res.status(400).json({ error: "Email alredy exists!" });
    }

    // hash the user password using bcrypt
    const salt: string = await bcrypt.genSalt(12);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    await saveUserDB(userName, email, hashedPassword);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

/**
 * @description Allows a user to log in
 * @route POST /api/auth/login
 * @access public user does not have to be authorized in to access the route.
 */
export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = req.cookies;

    // get email and password from the user
    const userInput = sanitizeUserInput(req.body) as {
      email: string;
      password: string;
    };

    const email = userInput.email;
    const userPassword = userInput.password;

    if (!email) {
      return res.status(400).json({ error: "Email required!" });
    }

    if (!userPassword) {
      return res.status(400).json({ error: "Password required!" });
    }

    const user: IUser = await getUserByEmailDB(email);

    if (!user) {
      return res.status(401).json({ error: "Email does not exist!" });
    }

    // evaluate password match
    const passwordsMatch: boolean = await bcrypt.compare(
      userPassword,
      user.password
    );

    if (!passwordsMatch) {
      return res.status(401).json({ error: "Wrong passoword!" });
    }

    // generate an access token and refresh token each time the user logs in on a device
    const accessToken: string = generateAccessToken(user.userId, user.roles);
    const newRefreshToken: string = generateRefreshToken(user.userId);

    // if there is a refresh token at login, the user goes to the login page without loging out before
    const newRefreshTokenArray = !cookies.refreshToken
      ? user.refreshTokens
      : user.refreshTokens.filter((rt) => rt !== cookies.refreshToken);

    if (cookies.refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        // domain: "http://localhost:5173",
        // path: "/api/auth/login",
      });
    }
    const userRefreshTokens = [...newRefreshTokenArray, newRefreshToken];
    await updateUserRefreshTokensDB(userRefreshTokens, user.userId);

    // Creates Secure Cookie with refresh token
    res.cookie("refreshToken", newRefreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: "strict",
      // domain: "http://localhost:5173/",
      // path: "api/auth/login",
      maxAge: 24 * 60 * 60 * 1000, // one day
    });

    // want to send all the user properties to the client except password and refresh tokens
    const { password, refreshTokens, ...otherUserProperties } = user;

    // Send the user and the access token to client.
    return res
      .status(200)
      .json({ user: otherUserProperties, accessToken: accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * @description Logs a user out (TODO: also clear accessToken on the client)
 * @route POST /api/auth/logout
 * @access public user does not have to be authorized in to access the route.
 */
export async function logoutUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = req.cookies;
    // console.log(cookies); // Output: {refreshToken: "..."}

    if (!cookies) {
      return res.sendStatus(204);
    }

    // return 204 status if the refresh token cookie is not sent with the request (there is nothing to do)
    if (!cookies.refreshToken) {
      // 204 status: the server has successfully processed the request, but it is not returning any content
      return res.sendStatus(204);
    }

    const refreshToken = sanitizeUserInput(cookies.refreshToken) as string;

    // if refresh token is not in the db but we still have a cookie, delete the cookie
    const user: IUser = await getUserByRefreshTokenDB(refreshToken);
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        // domain: "http://localhost:5173",
        // path: "/api/auth/logout",
      });

      // 204 status: the server has successfully processed the request, but it is not returning any content
      return res.sendStatus(204);
    }

    // Delete the current refreshToken from the db
    const userRefreshTokens: string[] = user.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );
    await updateUserRefreshTokensDB(userRefreshTokens, user.userId);

    // Delete the current cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      // domain: "http://localhost:5173",
      // path: "/api/auth/logout",
    });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

/**
 * @description if the access token is expired and the refresh token is not expired, it will create a new access token.
 * @route GET /api/auth/refresh
 * @access public user does not have to be authorized in to access the route.
 */
export async function refreshAccessToken(req: UserRequest, res: Response) {
  const cookies = req.cookies;

  if (!cookies) {
    return res.sendStatus(401);
  }

  // return 401 (unauthorized) status if the refresh token cookie is not sent with the request.
  // might help if an attacker tries to submit a form using a GET request from a different domain.
  // (form data is attached as query parameter in the url: http://localhost:3000/api/auth/refresh? or http://localhost:3000/api/auth/refresh?queryKey=queryValue)
  // (CORS does not prevent submiting forms from different domains)
  if (!cookies.refreshToken) {
    return res.sendStatus(401);
  }

  // save the refresh token cookie in memory and delete it, because every refresh token should only be used once. (a new will be cookie sent)
  const refreshToken = sanitizeUserInput(cookies.refreshToken) as string;
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  // get the user by the refresh token from the database
  const user = await getUserByRefreshTokenDB(refreshToken);

  // no user found. An attacker may try to reuse a refresh token which was used once by another user --> Refresh token reuse!
  if (!user) {
    // decode the token without checking if it is a valid token, or if it is expired or not.
    // it will also run on tempered tokens, but might not give any result / might return null on invalid input.
    const decodedUserInfo = jwt.decode(refreshToken) as UserJwtPayload;
    if (!decodedUserInfo) {
      return res.sendStatus(401);
    }
    if (!decodedUserInfo.userId) {
      return res.sendStatus(401);
    }
    // try to log hacked user out of all devices
    const hackedUser = await getUserByIdDB(decodedUserInfo.userId);
    const hackedUserRefreshTokens: string[] = [];
    await updateUserRefreshTokensDB(hackedUserRefreshTokens, hackedUser.userId);
    return res.sendStatus(401);
  }

  // user is found, refresh token is valid
  // remove it from the refresh token array
  const newRefreshTokenArray: string[] = user.refreshTokens.filter(
    (rt) => rt !== refreshToken
  );

  // evaluate jwt
  try {
    const decodedUserInfo = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as UserJwtPayload;

    // check that the id of the user found in the database matches the id of the user encoded/signed in the token
    // (otherwise the user found in the database might be an attacker who altered/modified the refresh token)
    if (user.userId !== decodedUserInfo.userId) {
      return res.sendStatus(401);
    }

    // Refresh token was still valid
    const newAccessToken = generateAccessToken(user.userId, user.roles);
    const newRefreshToken = generateRefreshToken(user.userId);

    // this new array contains all the tokens in the newRefreshTokenArray and the newRefreshToken
    const userRefreshTokens = [...newRefreshTokenArray, newRefreshToken];

    await updateUserRefreshTokensDB(userRefreshTokens, user.userId);

    // Creates Secure Cookie with refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // want to send all the user properties to the client except password and refresh tokens
    const { password, refreshTokens, ...otherUserProperties } = user;

    // send the user properties and the new access token
    return res
      .status(200)
      .json({ user: otherUserProperties, newAccessToken: newAccessToken });
  } catch (error) {
    // expired refresh token
    const userRefreshTokens = [...newRefreshTokenArray];
    await updateUserRefreshTokensDB(userRefreshTokens, user.userId);
    return res.sendStatus(401);
  }
}

/**
 *
 * @param userId the id of the user which logs in
 * @param roles the roles of the user which logs in
 * @returns a JSON Web Token (access token) that signs/encrypts a JSON object (the payload).
 * The object contains the id and the roles of the user making the request.
 * The access token is has a short live span and expires in 1 minute.
 *
 * IMPORTANT: make sure the UserJwtPayload interface must have the same properties as the payload object encrypted here!
 *
 */
function generateAccessToken(userId: string, roles: string[]): string {
  return jwt.sign(
    {
      userId: userId,
      userRoles: roles,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "300s",
      // expiresIn: "10s",
    }
  );
}

/**
 *
 * @param userId the id of the user which logs in
 * @returns a JSON Web Token (refresh token) that signs/encrypts a JSON object (the payload).
 * The object contains the id of the user making the request.
 * The refresh token has a longer life span and expires in 1 day .
 *
 * IMPORTANT: make sure the UserJwtPayload interface must have the same properties as the payload object encrypted here!
 *
 */
function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId: userId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
      // expiresIn: "30s",
    }
  );
}
