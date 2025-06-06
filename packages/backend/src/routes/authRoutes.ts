import express, { Request, Response, NextFunction } from "express";
import { CredentialsProvider } from "../credentialsProvider";
import { mongoClient } from "../connectMongo";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
  id: string,
  username: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: { username: string };
  }
}

function generateAuthToken(
  id: string,
  username: string,
  jwtSecret: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: IAuthTokenPayload = { id, username };

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: "1d" }, // Token valid for 24 hours
      (err, token) => {
        if (err || !token) {
          reject(err ?? new Error("Failed to sign token"));
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function registerAuthRoutes(app: express.Application) {
  const credentialsProvider = new CredentialsProvider(mongoClient);
  const registerHandler: express.RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({
        error: "Bad request",
        message: "Missing username or password",
      });
      return;
    }

    try {
      const success = await credentialsProvider.registerUser(username, password);

      if (!success) {
        res.status(409).json({
          error: "Conflict",
          message: "Username already taken",
        });
        return;
      }

      // On success, immediately generate a JWT for the new user:
      const jwtSecret = req.app.locals.JWT_SECRET as string;
      if (!jwtSecret) {
        console.error("Missing app.locals.JWT_SECRET");
        res.status(500).json({ error: "Server misconfiguration" });
        return;
      }

      const user = await credentialsProvider.findByUsername(username);
      if (!user) throw new Error("No userId found");

      const token = await generateAuthToken(user?._id.toString(), username, jwtSecret);

      // Return JSON { token } so the front end can pick it up:
      res.status(201).json({ token });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // Attach the registration handler:
  app.post("/auth/register", registerHandler);

  // Handler: POST /auth/login
  app.post(
    "/auth/login",
    async (req: Request, res: Response, next: NextFunction) => {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({
          error: "Bad Request",
          message: "Missing username or password",
        });
        return;
      }

      try {
        // Verify credentials
        const isValid = await credentialsProvider.verifyPassword(
          username,
          password
        );
        if (!isValid) {
          res.status(401).json({
            error: "Unauthorized",
            message: "Incorrect username or password",
          });
          return;
        }

        // Generate a JWT
        const jwtSecret = req.app.locals.JWT_SECRET as string;
        if (!jwtSecret) {
          console.error("Missing app.locals.JWT_SECRET");
          res.status(500).json({ error: "Server misconfiguration" });
          return;
        }

        const user = await credentialsProvider.findByUsername(username);
        if (!user) throw new Error("UserId not found");
        const token = await generateAuthToken(user._id.toString(), username, jwtSecret);

        // Return JSON { token }
        res.json({ token });
      } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  );
}
