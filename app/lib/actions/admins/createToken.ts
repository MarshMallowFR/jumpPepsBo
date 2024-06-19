import { randomBytes, createHash } from 'crypto';

export const generateActivationToken = () => {
  const token = randomBytes(32).toString('hex');
  return token;
};

export const hashActivationToken = (token: string) => {
  const hashedToken = createHash('sha256').update(token).digest('hex');
  return hashedToken;
};
