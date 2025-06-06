import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
  username: string;
}

export function verifyAuthToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).end();
    return;
  }

  const secret = req.app.locals.JWT_SECRET as string;
  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).end();
      return;
    }
    req.user = decoded as IAuthTokenPayload;
    next();
  });
}
