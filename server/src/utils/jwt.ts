import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export function generateAccessToken(userId: string, role: string): string {
  const options: SignOptions = {
    expiresIn: config.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId, role }, config.JWT_SECRET, options);
}

export function generateRefreshToken(userId: string): string {
  const options: SignOptions = {
    expiresIn: config.JWT_REFRESH_EXPIRY as SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
}
