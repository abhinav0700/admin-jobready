import jwt from 'jsonwebtoken';
import { config } from '@admin-panel/config';

export const signToken = (payload: any) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
